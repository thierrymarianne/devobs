const padWithCharacter = (subject, character) => {
  let paddedSubject = subject;
  if (subject < 10) {
    paddedSubject = `${character}${subject}`;
  }

  return paddedSubject;
};

const padDateDay = date => padWithCharacter(date.getDate(), 0);

const formatDate = date => {
  const day = padDateDay(date);
  const month = padWithCharacter(date.getMonth() + 1, 0);
  return `${date.getFullYear()}-${month}-${day}`;
};

const yesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  return formatDate(date);
};

const today = () => formatDate(new Date());

export default {
  today,
  yesterday
};
