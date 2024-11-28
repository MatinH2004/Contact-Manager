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
        renderHomePage();
      } else if (e.target.matches('.submit')) {
        addContact();
      } else if (e.target.matches('.delete')) {
        deleteContact(e.target);
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
    const input = e.target;
    const errorMsg = input.parentElement.querySelector('.error_message');

    if (document.querySelector('form') === null || !errorMsg) return;

    if (input.validity.patternMismatch) {
      input.classList.add('error');
      errorMsg.classList.add('error');
    } else if (input.validity.valueMissing) {
      input.classList.add('error');
      errorMsg.classList.add('error');
    } else {
      input.classList.remove('error');
      errorMsg.classList.remove('error');
    }
  }

  function containsFormErrors() {
    document.querySelectorAll('input[type="text"]').forEach(input => {
      handleInvalidFields({ target: input });
    });

    if (document.querySelectorAll('.error').length !== 0) {
      alert('Please fix form errors before submitting!');
      return true;
    }
  }

  function deleteContact(btn) {
    const id = btn.closest('div').getAttribute('data-id');

    if (confirm('Are you sure you want to delete this contact?')) {
      fetch(`http://localhost:3000/api/contacts/${id}`, { 
        method: 'delete',
      });

      renderHomePage();
    }
  }

  function addContact() {
    if (containsFormErrors()) return;

    const request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:3000/api/contacts/');
    request.setRequestHeader('Content-Type', 'application/json');

    const data = new FormData(document.querySelector('form'));
    const json = JSON.stringify({
      full_name: data.get('name'),
      email: data.get('email'),
      phone_number: data.get('telephone'),
      tags: getAllTags(),
    });

    request.addEventListener('load', () => {
      if (request.status === 201) {
        renderHomePage();
        alert('Contact Saved Successfully!');
      } else {
        alert('Error 400: Could Not Save Contact');
        console.error('Response:', request.responseText);
      }
    });

    request.send(json);
  }

  function getAllTags() {
    return [...document.querySelectorAll('input[type="checkbox"]:checked')].map(input => {
      return input.closest('label').textContent;
    }).concat(document.querySelector('#new_tag').value)
      .filter(tag => tag && tag.trim().length > 0)
      .join(',');
  }

  async function renderHomePage() {
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

  const templates = compileTemplates();

  bindEvents();
  registerPartials();
  renderHomePage();
});

/*

TODOS:
[x] delete contacts

[ ] edit contacts
[ ] add search by tag functionality
[ ] ajax when using search
  - add focus to searchbar
  - filter contact objects every input

*/ 