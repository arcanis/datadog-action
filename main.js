const {readFileSync} = require(`fs`);
const {request} = require(`https`);
const {get, set, template} = require(`lodash`);

const token = core.getInput(`token`, {required: true});
const fields = core.getInput(`fields`, {required: true});
const source = core.getInput(`source`, {required: true});
const message = core.getInput(`message`, {required: true});

const srcData = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, `utf8`));
const dstData = {};

for (const [dstKey, srcKey] of Object.values(fields))
    set(dstData, dstKey, get(srcData, srcKey));

const message = template(message, {
    sourceURL: null,
    variable: `gh`,
})(dstData);

const req = request({
    method: `POST`,
    hostname: `browser-http-intake.logs.datadoghq.com`,
    path: `/v1/input/${token}?ddsource=${source}&ddtags=version:0.0.1-006e5ce2e8c82ebea2b1415ff9e71e7cef10182a`,
    headers: {[`Content-Type`]: `text/plain;charset=UTF-8`},
});

req.write(
    JSON.stringify({
        source,
        message,
        date: Date.now(),
        gh: dstData,
    }),
);

req.end();
