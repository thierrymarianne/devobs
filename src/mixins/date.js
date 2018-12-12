export default {
  methods: {
    getCurrentDate() {
      const today = new Date();
      today.setDate(today.getDate() - 1);

      let day = today.getDate();
      if (today.getDate() < 10) {
        day = `0${day}`;
      }

      return `${today.getFullYear()}-${today.getMonth() + 1}-${day}`;
    }
  }
};
