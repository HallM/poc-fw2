import * as dust from 'dustjs-linkedin';

// try to import dustjs-helpers if they are available
try {
  require('dustjs-helpers');
} catch(_e) {
}

import * as mailgunjs from 'mailgun-js';
import * as fs from 'fs';
import * as path from 'path';

// using own cache and loader in case none was loaded. also, doesn't overwrite another loader
const dustTemplateCache = {};

function loadTemplate(templateName, renderOptions) {
  if (dustTemplateCache[templateName]) {
    return Promise.resolve(dustTemplateCache[templateName]);
  }

  const filepath = path.resolve(renderOptions.views, templateName + (renderOptions.ext || '.dust'));

  return new Promise((resolve, reject) => {
    fs.readFile(filepath, { encoding: 'utf8' }, function(err, data) {
      if (err) {
        reject(err);
        return;
      }

      const tmpl = dust.loadSource(data);
      dustTemplateCache[templateName] = tmpl;

      resolve(tmpl);
    });
  });
}

function dustRender(templatePath, context) {
  return new Promise((resolve, reject) => {
    dust.render(templatePath, context, function(err, content) {
      if (err) {
        reject(err);
        return;
      }

      resolve(content);
    });
  });
}

export default class EmailService {
  private emailer;
  private configDirectory;
  private viewsDirectory;
  private configCache;
  private defaultFrom;
  private siteAddress;
  private ignoreErrors;
  private logger;

  constructor(logger, options) {
    this.emailer = mailgunjs({apiKey: options.mailgunApiKey, domain: options.mailgunDomain});

    this.configDirectory = path.resolve(process.cwd(), options.configDirectory);
    this.viewsDirectory = path.resolve(process.cwd(), options.viewsDirectory);
    this.configCache = {};
    this.siteAddress = options.siteAddress;
    this.defaultFrom = options.defaultFrom;
    this.ignoreErrors = options.ignoreErrors;
    this.logger = logger;
  }

  resolveError(error) {
    if (this.ignoreErrors) {
      this.logger.warn(error);
      return Promise.resolve();
    } else {
      return Promise.reject(error);
    }
  }

  sendEmail(opts) {
    if (!opts) {
      return this.resolveError(new Error('Email service requires options including the "template".'));
    }

    const templateName = opts.template;

    if (!this.configCache[templateName]) {
      this.configCache[templateName] = require(path.resolve(this.configCache, templateName));
    }
    const template = this.configCache[templateName];

    if (!template) {
      return this.resolveError(`The config for the email template, ${templateName}, was not found.`);
    }

    const recipients = (getValue(template.to, opts) || []).concat(opts.recipients || []);
    if (!recipients.length) {
      return this.resolveError('No recipients defined to receive the email');
    }

    const toEmails = recipients.map(formatEmailAddress);
    const fromEmail = getValue(template.from, opts) || this.defaultFrom;

    if (!fromEmail) {
      return this.resolveError('No "from" email was defined');
    }

    const individualVars = recipients.reduce(function(obj, recipient) {
      const mergeVars = template.individualVars(recipient, opts);
      if (mergeVars) {
        obj[recipient.email] = mergeVars;
      }
      return obj;
    }, {});

    const subject = getValue(template.subject, opts);

    if (!fromEmail) {
      return this.resolveError('No "subject" was defined');
    }

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

    const promise = loadTemplate(templateName, renderOptions).then((tmpl) => {
      return dustRender(tmpl, context);
    }).then((htmlContent: string) => {
      if (!htmlContent || !htmlContent.length) {
        return this.resolveError('No content to send in an email');
      }

      const dataToSend = {
        from: fromEmail,
        to: toEmails,
        subject: subject,
        'recipient-variables': individualVars,
        html: htmlContent
      };

      return this.emailer.messages().send(dataToSend);
    });

    if (!this.ignoreErrors) {
      promise.catch((error) => {
        this.logger.warn(error);
        return null;
      });
    }

    return promise;
  }
}

function formatEmailAddress(person) {
  if (typeof person === 'string') {
    return person;
  }
  return person.name + ' <' + person.email + '>';
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
