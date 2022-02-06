export default function useUploadJson(onJson) {
  return function getFromFile(file) {
    if (file == null) return;
    try {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          onJson(json);
        } catch (e) {
          console.error(e);
        }
      };
      fileReader.readAsText(file);
    } catch (e) {
      console.error(e);
    }
  };
}
