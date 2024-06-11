import { object, string } from 'yup';

export enum CSVHeaders {
  'Email' = 'emailAddress',
  'Legal name' = 'fullName',
  'Student ID' = 'studentId',
  'Date of Birth (MM/DD/YYYY)' = 'dateOfBirth',
  'Pass (Yes/No)' = 'pass',
  'Date taken (MM/DD/YYYY)' = 'dateTaken',
}

export const CSV_HEADERS = Object.keys(CSVHeaders);
export const CSV_COLUMN_SEPARATOR_REGEXP = /,|;/;
export const CSV_DATE_SEPARATOR_REGEXP = /\.|\/|-/;
export const VALIDATION_ERROR = {
  isValid: false,
  processedCsvString: '',
  data: [],
  errorMessage: '',
};
const SPACE_VALIDATION_ERROR =
  'One or more legal names in the file start with or have space between. Please remove spaces before or between the legal name and upload the file again.';

export const validationRegEx = {
  alphanumeric: /^[0-9a-zA-Z]*$/,
  fullName: /^[^\s]+( [^\s]+)+$/,
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+){1,}$/,
  dateFormat_MM_DD_YYYY: /^(0?[1-9]|1[0-2])(\/|\.|-)(0?[1-9]|[12][0-9]|3[01])(\/|\.|-)\d{4}$/, // Note: may contains / . - as a separator
  passExamValue: /^(Yes|No)$/,
  notStartsWithSpace: /^(?!\s)/,
  notExtraSpace: /^((?!\s{2}).)*$/,
};

/**
 * Note: The order of the fields matters! Please don't change it.
 * For correct validation in components/BulkUpload/utils.ts file (87 line)
 * it MUST be changed to reverse the order of the CSVHeaders
 */
export const CSVUserSchema = object({
  [CSVHeaders['Date taken (MM/DD/YYYY)']]: string()
    .required('The Date taken field is required. Please ensure that each record has a valid date taken and try again.')
    .matches(
      validationRegEx.dateFormat_MM_DD_YYYY,
      'The MM/DD/YYYY data format is required for each record for the Date taken field. Please make changes and upload the file again.',
    )
    .test(
      'not-future-date',
      'You cannot provide future time period for the Date taken field. Please ensure that each record has a valid date taken and try again.',
      (values) => {
        if (!values) return false;

        const [mm, dd, yyyy] = values.split(CSV_DATE_SEPARATOR_REGEXP).map(Number);
        const today = new Date();
        const dateTaken = new Date(yyyy, mm - 1, dd, 0, 0);

        return dateTaken < today;
      },
    ),
  [CSVHeaders['Pass (Yes/No)']]: string()
    .required('The Pass field is required. Please ensure that each record has a valid pass and try again.')
    .matches(
      new RegExp(validationRegEx.passExamValue, 'i'),
      'Invalid data format. Use values Yes or No for the Pass field. Please make changes and upload the file again.',
    ),
  [CSVHeaders['Date of Birth (MM/DD/YYYY)']]: string()
    .required(
      'The Date of birth field is required. Please ensure that each record has a valid date of birth and try again.',
    )
    .matches(
      validationRegEx.dateFormat_MM_DD_YYYY,
      'The MM/DD/YYYY data format is required for each record for the Date of birth field. Please make changes and upload the file again.',
    ),
  [CSVHeaders['Student ID']]: string().required(
    'The Student ID field is required. Please ensure that each record has a valid student ID and try again.',
  ),
  [CSVHeaders['Legal name']]: string()
    .required('The Legal name field is required. Please ensure that each record has a valid legal name and try again.')
    .matches(validationRegEx.notStartsWithSpace, SPACE_VALIDATION_ERROR)
    .matches(validationRegEx.notExtraSpace, SPACE_VALIDATION_ERROR)
    .matches(
      validationRegEx.fullName,
      "One or more legal names in the file don't match the required format. Please make changes and upload the file again.",
    ),
  [CSVHeaders.Email]: string()
    .required('The Email field is required. Please ensure that each record has a valid email and try again.')
    .matches(
      validationRegEx.notStartsWithSpace,
      'One or more emails in the file start with space. Please remove spaces before the emails and upload the file again.',
    )
    .matches(
      validationRegEx.email,
      "One or more emails in the file don't match the required format. Please make changes and upload the file again.",
    ),
});

export type CSVUserSchemaType = typeof CSVUserSchema.__outputType;

const splitDate = (date: string) => date.split(CSV_DATE_SEPARATOR_REGEXP).map(Number); // MM/DD/YYYY

export const dateStringToISOString = (YYYY: number, MM: number, DD: number) =>
  new Date(Date.UTC(YYYY, MM - 1, DD, 0, 0, 0)).toISOString(); // month is zero-indexed, January === 0

export const datePickerDateToZonedTime = (date: Date) => {
  const zonedTime = new Date();

  zonedTime.setFullYear(date.getFullYear());
  zonedTime.setMonth(date.getMonth());
  zonedTime.setDate(date.getDate());

  return zonedTime;
};

const parseDateOfBirth = (date: string) => {
  const [MM, DD, YYYY] = splitDate(date);

  return dateStringToISOString(YYYY, MM, DD);
};

const parseDateTaken = (date: string) => {
  const [MM, DD, YYYY] = splitDate(date);

  const dateTaken = new Date(YYYY, MM - 1, DD);

  return datePickerDateToZonedTime(dateTaken);
};

const transformValues = (data: CSVUserSchemaType[]) => {
  return data.map(({ dateOfBirth, pass, dateTaken, ...rest }) => {
    return {
      ...rest,
      dateOfBirth: parseDateOfBirth(dateOfBirth),
      pass: pass.toUpperCase() === 'YES',
      dateTaken: parseDateTaken(dateTaken),
    };
  });
};

const trimValue = (column: string, value: string) => {
  if (column === CSVHeaders.Email || column === CSVHeaders['Legal name']) return value.trimEnd();

  return value.trim();
};

export const validateCsvData = async (
  csvString: string,
): Promise<{
  isValid: boolean;
  processedCsvString: string;
  data: { [ket: number]: string }[];
  errorMessage: string;
}> => {
  // Processing csv string for ms excel upload
  const processedCsvString = csvString
    .trim()
    .replace(/(,|;)+$/gm, '') // Removing trailing commas at end of the line
    .replace(/^\s*$/gm, ''); // Removing empty lines

  const lines = processedCsvString.split('\r\n');
  const header = lines[0].split(CSV_COLUMN_SEPARATOR_REGEXP);

  // Check if headers match
  if (!header.every((column, index) => column.trim() === CSV_HEADERS[index])) {
    return {
      ...VALIDATION_ERROR,
      errorMessage:
        "Column headings in this file don't match the template. Please make your columns match the format of the template file linked above.",
    };
  }

  const data = lines.slice(1).map((line) => {
    const values = line.replace('\r', '').split(CSV_COLUMN_SEPARATOR_REGEXP);

    return header.reduce((rowData, column, index) => {
      const columnName = CSVHeaders[column.trim() as keyof typeof CSVHeaders];
      const value = values[index];

      return {
        ...rowData,
        [columnName]: trimValue(columnName, value),
      };
    }, {} as CSVUserSchemaType);
  });

  // Check if not empty
  if (!data.length) {
    return {
      ...VALIDATION_ERROR,
      errorMessage: 'The file must contain at least one student record. Please make changes and upload the file again.',
    };
  }

  // Perform Yup validation on the data
  try {
    await Promise.all(data.map((item) => CSVUserSchema.validate(item)));
  } catch (error) {
    console.log(JSON.parse(JSON.stringify(error)));
    const errorObj = JSON.parse(JSON.stringify(error)) as unknown as { message: string };

    return { ...VALIDATION_ERROR, errorMessage: errorObj.message };
  }

  // Check if email is unique
  if (data.length !== new Set(data.map((item) => item[CSVHeaders.Email]))?.size) {
    return {
      ...VALIDATION_ERROR,
      errorMessage:
        "One or more emails in the file aren't unique. Please ensure that each record has a unique email and try again.",
    };
  }
  // Check if student ID is unique
  if (data.length !== new Set(data.map((item) => item[CSVHeaders['Student ID']]))?.size) {
    return {
      ...VALIDATION_ERROR,
      errorMessage:
        "One or more StudentIDs in the file aren't unique. Please ensure that each record has a unique email and try again.",
    };
  }

  return {
    isValid: true,
    processedCsvString,
    data: transformValues(data),
    errorMessage: '',
  };
};

const parseCsvForCerts = (csvString: string) => {
  // Processing csv string for ms excel upload
  const processedCsvString = csvString
    .trim()
    .replace(/(,|;)+$/gm, '') // Removing trailing commas at end of the line
    .replace(/^\s*$/gm, ''); // Removing empty lines

  const lines = processedCsvString.split('\n'); // or could be .split('\r\n');
  const header = lines[0].split(CSV_COLUMN_SEPARATOR_REGEXP);
  const rows = lines.slice(1);

  const rowsData = rows.map((line) => {
    const values = line.replace('\r', '').split(CSV_COLUMN_SEPARATOR_REGEXP);

    return { ...values };
  });

  console.log(rowsData);

  const pdfNames = rowsData.map((obj) => {
    return '###_@@@_cert.pdf'.replace('###', obj['6']).replace('@@@', obj['8']);
  });
  const pdfNamesWithStudentName = rowsData.reduce((acc, obj) => {
    const voucherId = obj['6'];
    const studentId = obj['8'];
    const studentName = obj['7'];
    const studentNameModif = studentName.replace(/\./g, '').replace(/\s/g, '_');

    const key = '###_@@@_cert.pdf'.replace('###', voucherId).replace('@@@', studentId);
    const value = `${studentNameModif}_###_@@@.pdf`.replace('###', studentId).replace('@@@', voucherId);

    return {
      ...acc,
      [key]: value,
    };
  }, {});

  console.log(JSON.stringify(pdfNames));
  console.log(JSON.stringify(pdfNamesWithStudentName));
};
