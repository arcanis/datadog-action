require(`./.pnp.js`).setup();

const {getInput} = require(`@actions/core`);
const {readFileSync} = require(`fs`);
const {request} = require(`https`);
const {get, set, template} = require(`lodash`);
const {inspect} = require(`util`);

const token = getInput(`token`, {required: true});
const fields = getInput(`fields`, {required: true});
const source = getInput(`source`, {required: true});
const messageTpl = getInput(`message`, {required: true});

const srcData = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, `utf8`));
const dstData = {};

for (const [dstKey, srcKey] of Object.entries(JSON.parse(fields)))
    set(dstData, dstKey, get(srcData, srcKey));

const message = template(messageTpl, {
    sourceURL: null,
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
