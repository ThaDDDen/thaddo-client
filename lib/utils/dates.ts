const today = new Date();
export const todayAsString = today.toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
