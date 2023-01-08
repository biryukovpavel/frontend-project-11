const parse = (rawData) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(rawData, 'text/xml');
  const errorNode = data.querySelector('parsererror');
  if (errorNode) {
    const error = new Error(errorNode.textContent);
    error.isParsingError = true;
    error.data = rawData;
    throw error;
  }

  const title = data.querySelector('channel > title').textContent;
  const description = data.querySelector('channel > description').textContent;
  const items = [...data.querySelectorAll('channel > item')].map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemDescription = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;

    return { title: itemTitle, description: itemDescription, link };
  });

  return { title, description, items };
};

export default parse;
