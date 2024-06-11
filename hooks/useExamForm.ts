import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

export enum ExamFormField {
  className = 'className',
  classSection = 'classSection',
  academicTerm = 'academicTerm',
}

export interface ExamForm {
  className: string;
  classSection: string;
  academicTerm: string;
}

const CLASS_NAME_LIMIT = 100;
const CLASS_NAME_REQUIRED_MSG = 'Class name is a required field.';

const SCHEMA = yup
  .object({
    [ExamFormField.className]: yup
      .string()
      .required(CLASS_NAME_REQUIRED_MSG)
      .max(CLASS_NAME_LIMIT, `Please limit your class name to ${CLASS_NAME_LIMIT} characters.`),
  })
  .required();

const DEFAULT_VALUES = {
  [ExamFormField.className]: '',
  [ExamFormField.classSection]: '',
  [ExamFormField.academicTerm]: '',
};

export const useExamForm = (defaultValues: Partial<typeof DEFAULT_VALUES> = DEFAULT_VALUES) => {
  return useForm<ExamForm>({
    resolver: yupResolver(SCHEMA),
    defaultValues,
  });
};
