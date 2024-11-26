document.addEventListener('DOMContentLoaded', () => {
  function registerPartials() {
    Handlebars.registerPartial('nav_partial', document.querySelector('#nav_partial').innerHTML);
    Handlebars.registerPartial('tag_partial', document.querySelector('#tag_partial').innerHTML);
    Handlebars.registerPartial('contact_partial', document.querySelector('#contact_partial').innerHTML);
    Handlebars.registerPartial('no_contact_partial', document.querySelector('#no_contact_partial').innerHTML);
    Handlebars.registerPartial('contact_tags_partial', document.querySelector('#contact_tags_partial').innerHTML);
  }

  function compileTemplates() {
    return [...document.querySelectorAll('script[id$="template"]')]
      .reduce((obj, template) => {
        obj[template.id] = Handlebars.compile(template.innerHTML);;
        return obj;
      }, {});
  }

  function bindEvents() {
    const main = document.querySelector('main');

    main.addEventListener('focusout', handleInvalidFields);
    main.addEventListener('click', e => {
      if (e.target.matches('.add_contact')) {;
        renderNewContactPage()
      } else if (e.target.matches('.cancel')) {
        main.innerHTML = fetchAllContacts();
      } else if (e.target.matches('.submit')) {
        handleFormSubmission();
      }
    });
  }

  function renderNewContactPage() {
    const tags = [...document.querySelectorAll('option')]
      .map(option => option.textContent)
      .slice(1);
    document.querySelector('main').innerHTML = 
      templates.new_contact_template({ tags: tags });
  }

  function handleInvalidFields(e) {
    if (document.querySelector('form') === null) return;

    const input = e.target;
    const errorMsgElement = input.parentElement.querySelector('.error_message');

    if (input.validity.valueMissing || input.validity.patternMismatch) {
      errorMsgElement.classList.add('active');
    } else {
      errorMsgElement.classList.remove('active');
    }
  }

  function handleFormErrors() {
    document.querySelectorAll('input[type="text"]').forEach(input => {
      if (input.id === 'new_tag') return;
      handleInvalidFields({ target: input });
    });

    if (document.querySelectorAll('.active').length !== 0) {
      alert('Please fix form errors before submitting!');
    }
  }

  function handleFormSubmission() {
    handleFormErrors();

    // to be continued
  }

  async function fetchAllContacts() {
    try {
      const response = await fetch('http://localhost:3000/api/contacts');
      const data = await response.json();

      data.forEach(contact => {
        contact.tags = contact.tags ? contact.tags.split(',') : [];
      });

      const tags = [...new Set(data.flatMap(({tags}) => tags))];

      renderContacts(data);
      renderTags(tags);

    } catch (error) {

      console.error('Error fetching contacts:', error);
      return [];
    }
  }

  function renderContacts(data) {
    document.querySelector('main').innerHTML = 
      templates.home_template({ contacts: data });
  }

  function renderTags(data) {
    const tagsList = document.querySelector('#tags_list');

    data.forEach(tag => {
      let select = document.createElement('option');
      select.value = tag;
      select.textContent = tag;
      tagsList.appendChild(select);
    });
  }

  const main = document.querySelector('main');
  const templates = compileTemplates();

  bindEvents();
  registerPartials();
  fetchAllContacts();
});

/*

TODOS:
[ ] form submission
[ ] design/show tags in contacts
[ ] ajax when using search
  - add focus to searchbar
  - filter contact objects every input
[ ] add options list to search by tag
  - :tag in search bar

[x] individual contact design
[x] align search with button

NOT URGENT:
[] 

*/ 