import { CoreTypography } from '@youscience/khaleesi';
import { commonColors } from '@youscience/theme';

import CancelIcon from '@mui/icons-material/Cancel';

import { StyledErrorWrapper } from './BulkUpload.styles';

export const BulkUploadError = ({ title, error }: { title?: string; error: string }) => {
  return (
    <StyledErrorWrapper>
      <CancelIcon color="error" />
      <CoreTypography variant="body1">
        {title}
        <CoreTypography variant="caption" display="block" color={commonColors.orange}>
          {error}
        </CoreTypography>
      </CoreTypography>
    </StyledErrorWrapper>
  );
};
