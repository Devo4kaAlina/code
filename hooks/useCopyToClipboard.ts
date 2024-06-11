export const useCopyToClipboard = () => {
  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);

      console.log('Copied to clipboard');
    } catch (error) {
      console.log(error);
    }
  };

  return copyToClipboard;
};
