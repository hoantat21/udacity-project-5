// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'ilicmdck6h'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'nvc179.au.auth0.com',            // Auth0 domain
  clientId: 'bQOne9qU9h0Qr1ilLZAxC3jeURnBbPnn',          // Auth0 client id
  callbackUrl: 'afe22671063d14a2696f0ea203406347-337680981.us-east-1.elb.amazonaws.com:8080/callback'
}
