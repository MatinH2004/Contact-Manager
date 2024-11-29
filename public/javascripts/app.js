const App = {
  init() {
    this.templates = this.compileTemplates();
    this.registerPartials();
    this.renderHomePage()
    this.bindEvents();
  },

  compileTemplates() {
    return [...document.querySelectorAll('script[id$="template"]')]
      .reduce((obj, template) => {
        obj[template.id] = Handlebars.compile(template.innerHTML);;
        return obj;
      }, {});
  },

  registerPartials() {
    document.querySelectorAll('script[id$="partial"]').forEach(partial => {
      Handlebars.registerPartial(partial.id, partial.innerHTML);
    });
  },

  bindEvents() {
    const clickHandlers = {
      '.add_contact': () => this.renderForm(),
      '.cancel': () => this.renderHomePage(),
      '.submit': () => this.submitForm(),
      '.edit': target => this.editContact(target),
      '.delete': target => this.deleteContact(target),
    };

    document.addEventListener('focusout', this.handleInvalidFields);

    document.addEventListener('change', e => {
      if (e.target.matches('#tags_list')) this.fetchContactsByTag(e);
    });

    document.addEventListener('input', e => {
      if (e.target.matches('#search')) this.fetchContactsBySearch();
    });

    document.addEventListener('click', e => {
      const target = e.target;

      for (const selector in clickHandlers) {
        if (target.matches(selector)) {
          clickHandlers[selector](target);
          break;
        }
      }
    });
  },

  handleInvalidFields(event) {
    const input = event.target;
    const errorMsg = input.parentElement.querySelector('.error_message');

    if (document.querySelector('form') === null || !errorMsg) return;

    const hasError = input.validity.patternMismatch || input.validity.valueMissing;

    input.classList.toggle('error', hasError);
    errorMsg.classList.toggle('error', hasError);
  },

  containsFormErrors() {
    document.querySelectorAll('input[type="text"]').forEach(input => {
      this.handleInvalidFields({ target: input });
    });

    if (document.querySelectorAll('.error').length !== 0) {
      alert('Please fix form errors before submitting!');
      return true;
    }

    return false;
  },

  getAllTags() {
    return [...document.querySelectorAll('input[type="checkbox"]:checked')].map(input => {
      return input.closest('label').textContent;
    }).concat(document.querySelector('#new_tag').value)
      .filter(tag => tag && tag.trim().length > 0)
      .join(',');
  },

  submitForm(modifyContact = false, id = null) {
    if (this.containsFormErrors()) return;

    const data = new FormData(document.querySelector('form'));
    const json = JSON.stringify({
      full_name: data.get('name'),
      email: data.get('email'),
      phone_number: data.get('telephone'),
      tags: this.getAllTags(),
    });

    modifyContact ? this.updateContact(json, id) : this.createContact(json);
  },

  async createContact(json) {
    await fetch('http://localhost:3000/api/contacts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: json,
    }).then(() => this.renderHomePage());
  },

  async updateContact(json, id) {
    await fetch(`http://localhost:3000/api/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: json,
    }).then(() => this.renderHomePage());
  },

  async deleteContact(target) {
    const id = target.closest('div').getAttribute('data-id');

    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/contacts/${id}`, { 
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete contact.');

        await this.renderHomePage();
      } catch (error) {
        console.error(error);
      }
    }
  },

  async editContact(target) {
    const getContactId = () => target.closest('div.contact')?.getAttribute('data-id');

    const setFormFields = (contact) => {
      document.querySelector('#form_title p').textContent = 'Edit Contact';
      document.querySelector('input[name="name"]').value = contact.full_name;
      document.querySelector('input[name="email"]').value = contact.email;
      document.querySelector('input[name="telephone"]').value = contact.phone_number;

      if (contact.tags) {
        const tags = contact.tags.split(',');

        document.querySelectorAll('input[type="checkbox"]').forEach(tag => {
          tag.checked = tags.includes(tag.closest('label').textContent);
        });
      }
    }

    const updateSubmitButton = () => {
      const submitBtn = document.querySelector('.submit');
      submitBtn.classList.remove('submit');
      submitBtn.addEventListener('click', e => {
        e.preventDefault();
        this.submitForm(true, id);
      });
    }

    const id = getContactId();

    try {
      const response = await fetch(`http://localhost:3000/api/contacts/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch contact with ID: ${id}`);

      const contact = await response.json();

      this.renderForm();
      setFormFields(contact);
      updateSubmitButton(id);
    } catch (error) {
      console.error(error);
    }
  },

  async fetchAllContacts() {
    try {
      const response = await fetch('http://localhost:3000/api/contacts');
      const data = await response.json();

      data.forEach(contact => {
        contact.tags = contact.tags ? contact.tags.split(',') : [];
      });

      return data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  },

  fetchContactsBySearch() {
    const searchValue = document.querySelector('#search').value.toLowerCase();

    let matches = this.contacts.filter(({ full_name }) => {
      return full_name.toLowerCase().startsWith(searchValue);
    });

    if (searchValue.length === 0) {
      matches = this.contacts;
    }

    document.querySelector('main #contacts_wrapper').innerHTML = 
      this.templates.contacts_template({ contacts: matches, searchValue });
  },

  fetchContactsByTag(event) {
    const selectElement = event.target;
    const selectedIndex = selectElement.selectedIndex;
    const selectedTag = selectElement.value;

    let matches = this.contacts.filter(({ tags }) => tags.includes(selectedTag));

    if (selectedIndex === 0) matches = this.contacts;

    document.querySelector('main #contacts_wrapper').innerHTML =
      this.templates.contacts_template({ contacts: matches });
  },

  async renderHomePage() {
    this.contacts = await this.fetchAllContacts();
    const tags = [...new Set(this.contacts.flatMap(({ tags }) => tags))];

    this.renderContacts(this.contacts);
    this.renderTags(tags);
  },

  renderForm() {
    const tags = [...document.querySelectorAll('option')]
      .map(option => option.textContent)
      .slice(1);

    document.querySelector('main').innerHTML = 
      this.templates.new_contact_template({ tags: tags });
  },

  renderContacts(data) {
    document.querySelector('main').innerHTML = 
      this.templates.home_template({ contacts: data });
  },

  renderTags(data) {
    const tagsList = document.querySelector('#tags_list');

    data.forEach(tag => {
      let select = document.createElement('option');
      select.value = tag;
      select.textContent = tag;
      tagsList.appendChild(select);
    });
  },
}

document.addEventListener('DOMContentLoaded', App.init.bind(App));