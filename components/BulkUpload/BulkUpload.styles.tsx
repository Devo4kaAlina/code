import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { styled } from '@mui/material';
import { CoreButton, coreThemeColors } from '@youscience/khaleesi';

type PaletteWithBorder = { outlinedRestingBorder: string; outlinedHoverBackground: string };

export const StyledCoreButton = styled(CoreButton)(() => ({
  width: '8.75rem',
  marginTop: '0.75rem',
}));

export const StyledWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

export const StyledForm = styled('form')(() => ({
  maxWidth: '100%',
  position: 'relative',
  textAlign: 'center',
  width: '100%',
}));

export const StyledInput = styled('input')({
  display: 'none',
  pointerEvents: 'none',
});

export const StyledLabel = styled('label')<{ dragActive?: boolean }>(({ theme, dragActive }) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '1.25rem',
  padding: '1rem 0',
  marginTop: '1rem',
  backgroundColor: coreThemeColors.components.backgroundColor,
  border: `1px dashed ${coreThemeColors.components.divider}`,
  borderRadius: 2,
  cursor: 'pointer',

  ...(dragActive
    ? {
        borderColor: (theme.palette.primary as unknown as PaletteWithBorder).outlinedRestingBorder,
        backgroundColor: (theme.palette.info as unknown as PaletteWithBorder).outlinedHoverBackground,
      }
    : {}),
}));

export const StyledErrorWrapper = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
  marginTop: '1rem',
  width: '100%',
  backgroundColor: coreThemeColors.components.backgroundColor,
}));

export const StyledClearButtonWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'end',
  width: '100%',
  marginTop: '0.5rem',
});

export const StyledFileUploadIcon = styled(FileUploadOutlinedIcon)({
  height: '30px',
  pointerEvents: 'none',
  width: '30px',
});
