import he from 'he';
import EmojiConvertor from 'emoji-js';
import Errors from './errors';

export default {
  methods: {
    parseTextForEmojis(subject, preventThrowing) {
      if (!subject || subject.length === 0) {
        return subject;
      }

      const parser = new DOMParser();
      const dom = parser.parseFromString(
        `<!doctype html><body>${subject}</body>`,
        'text/html'
      );
      const parsedSubject = he.escape(dom.body.textContent);
      const emoji = new EmojiConvertor();

      // @see https://github.com/iamcal/emoji-data
      emoji.img_sets.apple.path =
        'https://revue-de-presse.weaving-the-web.org/emoji-data/img-apple-64/';
      const subjectWithEmojiReplaced = emoji.replace_unified(parsedSubject);

      if (subjectWithEmojiReplaced.indexOf('??') > -1 && !preventThrowing) {
        throw new Errors.InvalidEmoji();
      }

      return subjectWithEmojiReplaced;
    }
  }
};
