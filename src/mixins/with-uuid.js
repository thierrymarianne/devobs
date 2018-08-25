import uuidv5 from 'uuid/v5';

const WithUuid = {
  methods: {
    generateUuid: function (name, namespace) {
      return uuidv5(`${name}`, namespace);
    },
  },
};

export default WithUuid;
