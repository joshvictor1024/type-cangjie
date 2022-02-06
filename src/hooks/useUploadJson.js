export default function useUploadJson(onJson, onError) {
  onJson = onJson ?? (() => {});
  onError = onError ?? (() => {});
  return function getFromFile(file) {
    if (file == null) {
      onError();
      return;}
    try {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          onJson(json);
        } catch (e) {
          onError();
          console.error(e);
        }
      };
      fileReader.readAsText(file);
    } catch (e) {
      console.error(e);
      onError();
    }
  };
}
