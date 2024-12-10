class BackendService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async fetchAllContacts() {
    try {
      const response = await fetch(`${this.baseURL}/contacts`);
      const data = await response.json();
      data.forEach(contact => {
        contact.tags = contact.tags ? contact.tags.split(',') : [];
      });
      return data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }

  async createContact(json) {
    return await fetch(`${this.baseURL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: json,
    });
  }

  async updateContact(json, id) {
    return await fetch(`${this.baseURL}/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: json,
    });
  }

  async deleteContact(id) {
    return await fetch(`${this.baseURL}/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async fetchContactById(id) {
    try {
      const response = await fetch(`${this.baseURL}/contacts/${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch contact with ID: ${id}`, error);
    }
  }
}

const App = {
  init() {
    this.backend = new BackendService('http://localhost:3000/api');
    this.templates = this.compileTemplates();
    this.registerPartials();
    this.renderHomePage();
    this.bindEvents();
  },

  compileTemplates() {
    return [...document.querySelectorAll('script[id$="template"]')].reduce((obj, template) => {
      obj[template.id] = Handlebars.compile(template.innerHTML);
      return obj;
    }, {});
  },

  registerPartials() {
    document.querySelectorAll('script[id$="partial"]').forEach(partial => {
      Handlebars.registerPartial(partial.id, partial.innerHTML);
    });
  },

  async renderHomePage() {
    this.contacts = await this.backend.fetchAllContacts();
    const tags = [...new Set(this.contacts.flatMap(({ tags }) => tags))];
    this.renderContacts(this.contacts);
    this.renderTags(tags);
  },

  renderForm() {
    const tags = [...document.querySelectorAll('option')].map(option => option.textContent).slice(1);
    document.querySelector('main').innerHTML = this.templates.new_contact_template({ tags: tags });
  },

  renderContacts(data) {
    document.querySelector('main').innerHTML = this.templates.home_template({ contacts: data });
  },

  renderTags(data) {
    const tagsList = document.querySelector('#tags_list');
    data.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      tagsList.appendChild(option);
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
    if (!errorMsg || document.querySelector('form') === null) return;

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

  async submitForm(modifyContact = false, id = null) {
    if (this.containsFormErrors()) return;

    const data = new FormData(document.querySelector('form'));
    const json = JSON.stringify({
      full_name: data.get('name'),
      email: data.get('email'),
      phone_number: data.get('telephone'),
      tags: this.getAllTags(),
    });

    if (modifyContact) {
      await this.backend.updateContact(json, id);
    } else {
      await this.backend.createContact(json);
    }
    this.renderHomePage();
  },

  async editContact(target) {
    const id = target.closest('div.contact')?.getAttribute('data-id');
    const contact = await this.backend.fetchContactById(id);

    this.renderForm();
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

    const submitButton = document.querySelector('.submit');
    submitButton.classList.remove('submit');
    submitButton.addEventListener('click', e => {
      e.preventDefault();
      this.submitForm(true, id);
    });
  },

  async deleteContact(target) {
    const id = target.closest('div').getAttribute('data-id');
    if (confirm('Are you sure you want to delete this contact?')) {
      await this.backend.deleteContact(id);
      this.renderHomePage();
    }
  },

  fetchContactsBySearch() {
    const searchValue = document.querySelector('#search').value.toLowerCase();
    const matches = this.contacts.filter(({ full_name }) => full_name.toLowerCase().startsWith(searchValue));
    document.querySelector('main #contacts_wrapper').innerHTML =
      this.templates.contacts_template({ contacts: searchValue ? matches : this.contacts, searchValue });
  },

  fetchContactsByTag(event) {
    const selectedTag = event.target.value;
    const matches = this.contacts.filter(({ tags }) => tags.includes(selectedTag));
    document.querySelector('main #contacts_wrapper').innerHTML =
      this.templates.contacts_template({ contacts: matches.length > 0 ? matches : this.contacts });
  },

  getAllTags() {
    return [...document.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.closest('label').textContent)
      .concat(document.querySelector('#new_tag').value)
      .filter(tag => tag.trim().length > 0)
      .join(',');
  }
};

document.addEventListener('DOMContentLoaded', App.init.bind(App));