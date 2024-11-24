const contacts = [
  {
    "id": 1,
    "full_name": "Arthur Dent",
    "email": "dent@example.com",
    "phone_number": "12345678901",
    "tags": "work,business"
  },
  {
    "id": 2,
    "full_name": "George Smiley",
    "email": "smiley@example.com",
    "phone_number": "12345678901",
    "tags": null
  }
];

const tags = ['student', 'teacher', 'lead']

document.addEventListener('DOMContentLoaded', () => {
  function registerPartials() {
    Handlebars.registerPartial('tag_partial', document.querySelector('#tag_partial').innerHTML);
    Handlebars.registerPartial('no_contact_partial', document.querySelector('#no_contact_partial').innerHTML);
    Handlebars.registerPartial('nav_partial', document.querySelector('#nav_partial').innerHTML);
  }

  function compileTemplates() {
    return [...document.querySelectorAll('script[id$="template"]')]
      .reduce((obj, template) => {
        obj[template.id] = Handlebars.compile(template.innerHTML);;
        return obj;
      }, {});
  }
  
  const main = document.querySelector('main');
  const templates = compileTemplates();
  registerPartials();

  main.innerHTML = templates.home_template({ contacts: contacts });

  main.addEventListener('click', e => {
    console.log('click');
    if (e.target.matches('.add_contact')) {
      main.innerHTML = templates.new_contact_template({ tags: tags });
    } else if (e.target.matches('.cancel')) {
      main.innerHTML = templates.home_template({ contacts: contacts });
    }
  });

  main.addEventListener('focusout', e => {
    const input = e.target;
    const errorMsgElement = input.parentElement.querySelector('.error_message');

    if (input.validity.valueMissing || input.validity.patternMismatch) {
      errorMsgElement.style.display = 'block';
    } else {
      errorMsgElement.style.display = 'none';
    }
  });
});

/*

TODOS:
[ ] form submission
[ ] ajax when using search
[ ] add options list to search by tag
- :tag in search bar

[x] individual contact design
[x] align search with button

NOT URGENT:
[] 

*/ 