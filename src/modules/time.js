const padDateDay = date => {
  let day = date.getDate();
  if (date.getDate() < 10) {
    day = `0${day}`;
  }

  return day;
};

const formatDate = date => {
  const day = padDateDay(date);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${day}`;
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
