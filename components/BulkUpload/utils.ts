import {
  CSVHeaders,
  CSVUserSchema,
  CSV_COLUMN_SEPARATOR_REGEXP,
  CSV_DATE_SEPARATOR_REGEXP,
  CSV_HEADERS,
  VALIDATION_ERROR,
} from '@constants/bulkUpload';
import { CSVUser, CSVUserSchemaType } from '@interfaces/BulkUpload';
import { datePickerDateToZonedTime, dateStringToISOString } from '@utils/date';

const splitDate = (date: string) => date.split(CSV_DATE_SEPARATOR_REGEXP).map(Number); // MM/DD/YYYY

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
  data: CSVUser[];
  errorMessage: string;
}> => {
  // Processing csv string for ms excel upload
  const processedCsvString = csvString
    .trim()
    .replace(/(,|;)+$/gm, '') // Removing trailing commas at end of the line
    .replace(/^\s*$/gm, ''); // Removing empty lines

  const lines = processedCsvString.split('\r\n');
  const header = lines[0].split(CSV_COLUMN_SEPARATOR_REGEXP);

  const data1 = processedCsvString
    .split('\n')
    .slice(1)
    .map((line) => {
      const values = line.replace('\r', '').split(CSV_COLUMN_SEPARATOR_REGEXP);

      return { ...values };
    });

  // console.log(data1);
  // const IDS = data1.map((obj) => obj['8']);
  // console.log(JSON.stringify(IDS));

  const pdfNames = data1.map((obj) => {
    return '###_@@@_cert.pdf'.replace('###', obj['6']).replace('@@@', obj['8']);
  });
  const pdfNamesWithStudentName = data1.reduce((acc, obj) => {
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

  console.log(JSON.stringify(pdfNamesWithStudentName));
  // console.log(JSON.stringify(pdfNames));

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
