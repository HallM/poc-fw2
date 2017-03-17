import * as dust from 'dustjs-linkedin';
import * as mailgunjs from 'mailgun-js';
import * as fs from 'fs';
import * as path from 'path';

export default class EmailService {
  private emailer;
  private configDirectory;
  private viewsDirectory;
  private configCache;
  private defaultFrom;
  private siteAddress;

  constructor(configDirectory, viewsDirectory, mailgunDomain, mailgunApiKey, siteAddress, defaultFrom, logger) {
    this.emailer = mailgunjs({apiKey: mailgunApiKey, domain: mailgunDomain});

    this.configDirectory = path.resolve(process.cwd(), configDirectory);
    this.viewsDirectory = path.resolve(process.cwd(), viewsDirectory);
    this.configCache = {};
    this.siteAddress = siteAddress;
    this.defaultFrom = defaultFrom;
  }

  sendEmail(opts) {
    if (!opts) {
      return Promise.resolve();
    }

    const templateName = opts.template;

    if (!this.configCache[templateName]) {
      this.configCache[templateName] = require(path.resolve(this.configCache, templateName));
    }
    const template = this.configCache[templateName];

    if (!template) {
      return Promise.reject(`The email template, ${templateName}, was not found.`);
    }

    const recipients = getValue(template.to, opts) || opts.recipients
    if (!recipients.length) {
      return Promise.resolve();
    }

    const toEmails = recipients.map(formatEmailAddress);
    const fromEmail = getValue(template.from, opts) || this.defaultFrom;

    const individualVars = recipients.reduce(function(obj, recipient) {
      const mergeVars = template.individualVars(recipient, opts);
      if (mergeVars) {
        obj[recipient.email] = mergeVars;
      }
      return obj;
    }, {});

    const subject = getValue(template.subject, opts);

    return new Promise((resolve, reject) => {
        let locals = template.mergeVars(opts);
        locals.emailurl = this.siteAddress;
        const renderOptions = {
          view: null,
          views: this.viewsDirectory,
          name: templateName,
          ext: '.dust',
          locals: locals
        };

        const context = dust.context({}, renderOptions).push(locals);
        const templatePath = path.resolve(this.viewsDirectory, templateName);
        dust.render(templatePath, context, function(err, content) {
          if (err) {
            reject(err);
            return;
          }

          resolve(content);
        });
    }).then((htmlContent: string) => {
        if (!htmlContent || !htmlContent.length) {
          return Promise.reject('No content to send');
        }

        const dataToSend = {
          from: fromEmail,
          to: toEmails,
          subject: subject,
          'recipient-variables': individualVars,
          html: htmlContent
        };

        this.emailer.messages().send(dataToSend);
      });
  }
}

function formatEmailAddress(person) {
  if (typeof person === 'string') {
    return person;
  }
  return person.name + '<' + person.email + '>';
}

function getValue(item, opts) {
  if (!item) {
    return null;
  }

  if (item instanceof Function) {
    return item(opts);
  }

  return item;
}
