import { Link } from '@mui/material';
import { CoreButton, CoreTypography } from '@youscience/khaleesi';
import { DragEvent, useRef, useState } from 'react';

import { CSV_TEMPLATE_LINK, DEFAULT_FILE_ACCEPTS, DEFAULT_FILE_SIZE } from '@constants/bulkUpload';
import { CSVUser } from '@interfaces/BulkUpload';

import {
  StyledClearButtonWrapper,
  StyledFileUploadIcon,
  StyledForm,
  StyledInput,
  StyledLabel,
  StyledWrapper,
} from './BulkUpload.styles';
import { BulkUploadError } from './BulkUploadError';
import { validateCsvData } from './utils';

export const BulkUpload = ({ onLoaded }: { onLoaded: (users: CSVUser[]) => void }) => {
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClearState = () => {
    setError(null);
    setUploadedFile(null);
    onLoaded([]);

    if (inputFileRef.current) inputFileRef.current.value = '';
  };

  const handleUpload = async (file: File) => {
    setUploadedFile(file);

    if (!file.name.endsWith(DEFAULT_FILE_ACCEPTS)) {
      setError('Unsupported file type. Please upload a .csv file.');
      return;
    }

    if (file.name.includes(' ')) {
      file.name.replaceAll(' ', '_');
    }

    if (file.size > DEFAULT_FILE_SIZE * 1024 * 1024) {
      setError(`The file size is too big. Max file size: ${DEFAULT_FILE_SIZE}MB`);
      return;
    }

    const fileReader = new FileReader();

    const csvDataForUpload = await new Promise<string>((resolve, reject) => {
      fileReader.onload = (event) => resolve(event?.target?.result as string);
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsText(file);
    });

    const validationResult = await validateCsvData(csvDataForUpload);

    if (!validationResult.isValid) {
      setError(validationResult.errorMessage);
      return;
    }

    setError(null);
    onLoaded(validationResult.data);
  };

  // event handlers for drag/drop and manual selection
  const handleDrag = (e: DragEvent) => {
    e.nativeEvent.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e?.nativeEvent?.preventDefault();

    if (!e) return;

    const uploadedFile = e.nativeEvent?.dataTransfer?.files[0]; // Only handle the first file

    if (uploadedFile) {
      setDragActive(false);
      void handleUpload(uploadedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];

    if (uploadedFile) {
      void handleUpload(uploadedFile);
    }
  };

  return (
    <StyledWrapper>
      <CoreTypography variant="body1">
        <Link href={CSV_TEMPLATE_LINK} color="secondary">
          Download the template
        </Link>{' '}
        to add your learners and upload as a .csv here.
      </CoreTypography>

      <StyledForm
        id="form-file-upload"
        onSubmit={(e) => e.preventDefault()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onDragOver={handleDrop}
      >
        <StyledLabel
          data-testid="form-drag-and-drop-area-test-id"
          id="label-file-upload"
          htmlFor="input-file-upload"
          dragActive={dragActive}
        >
          <StyledInput
            data-testid="drag-and-drop-csv-uploader-test-id"
            id="input-file-upload"
            key={uploadedFile?.lastModified?.toString() || 'input-file-upload'}
            onChange={(e) => handleFileSelect(e)}
            type="file"
            ref={inputFileRef}
          />
          <StyledFileUploadIcon color="primary" />
          {!!uploadedFile && !error ? (
            <CoreTypography variant="body1" sx={{ pointerEvents: 'none' }}>
              {uploadedFile.name}
            </CoreTypography>
          ) : (
            <CoreTypography variant="body1" sx={{ pointerEvents: 'none' }}>
              Click or drag file to this area to upload
              <CoreTypography
                variant="caption"
                align="center"
                display="block"
                color="text.disabled"
                sx={{ pointerEvents: 'none' }}
              >
                Only .csv files are accepted
              </CoreTypography>
            </CoreTypography>
          )}
        </StyledLabel>
      </StyledForm>

      {error && <BulkUploadError title={uploadedFile?.name} error={error} />}

      {(!!uploadedFile || error) && (
        <StyledClearButtonWrapper>
          <CoreButton color="primary" variant="text" onClick={handleClearState}>
            Clear
          </CoreButton>
        </StyledClearButtonWrapper>
      )}
    </StyledWrapper>
  );
};
