import { CoreBox } from '@youscience/khaleesi';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { BulkUpload } from '@components/BulkUpload';
import { ConfirmationModal } from '@components/Modals';
import { useBulkUpload } from '@hooks/useBulkUpload';
import { CSVUser } from '@interfaces/BulkUpload';
import { RootState, store } from '@store';
import { getIsThirdPartyExam } from '@utils/getIsThirdPartyExam';

import { StyledCoreButton } from './BulkUpload.styles';
import { BulkUploadError } from './BulkUploadError';

const selection = store.select((module) => ({
  examDetails: module.manageExamAccess.examDetailsSelector,
}));
const stateSelection = (state: RootState) => state.loading.effects.bulkUpload.getUsersData.loading;

export const BulkUploadButton = () => {
  const { examDetails } = useSelector(selection);
  const isGUSLoading = useSelector(stateSelection);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isGUSError, setGUSError] = useState(false);
  const [users, setUsers] = useState<CSVUser[]>([]);

  const { handleInviteUsers, handleBulkAssessmentSessionsCreation } = useBulkUpload();

  const isThirdPartyExam = getIsThirdPartyExam(examDetails?.data.voucherType);

  useEffect(() => {
    if (!isModalOpen) setGUSError(false);
  }, [isModalOpen]);

  if (!isThirdPartyExam) return null;

  const handleToggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  const handleBulkUpload = async () => {
    try {
      const usersWithUserId = await handleInviteUsers(users);

      handleToggleModal();

      void handleBulkAssessmentSessionsCreation(examDetails.data._id, usersWithUserId);
    } catch (error) {
      setGUSError(true);
    }
  };

  return (
    <>
      <StyledCoreButton
        onClick={handleToggleModal}
        variant="outlined"
        aria-label="Bulk upload learners list"
        endIcon={<FileUploadOutlinedIcon color="primary" />}
      >
        Bulk upload
      </StyledCoreButton>
      {isModalOpen && (
        <ConfirmationModal
          isOpen
          dialogProps={{ maxWidth: 'xs' }}
          title="Add multiple learners"
          content={
            <CoreBox>
              <BulkUpload onLoaded={setUsers} />
              {isGUSError && <BulkUploadError error="Something went wrong. Please try again later." />}
            </CoreBox>
          }
          onClose={handleToggleModal}
          onApply={handleBulkUpload}
          isApplyBtnDisabled={!users.length}
          isApplyLoading={isGUSLoading}
          submitBtnText="Submit"
        />
      )}
    </>
  );
};
