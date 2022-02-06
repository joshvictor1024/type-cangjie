export function getIsoDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = (today.getMonth() + 1).toString().padStart(2, "0");
  const dd = today.getDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
export function validateIsoDate(str) {
  try {
    const [yyyy, mm, dd] = str.split("-");
    if (yyyy.length !== 4 || mm.length !== 2 || dd.length !== 2) {
      return false;
    }
    const year = parseInt(yyyy, 10);
    const month = parseInt(mm, 10) - 1;
    const date = parseInt(dd, 10);
    const newDate = new Date();
    newDate.setFullYear(year, month, date);
    if (
      newDate.getFullYear() !== year ||
      newDate.getMonth() !== month ||
      newDate.getDate() !== date
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
