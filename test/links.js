var chai = require('chai');
var superagent = require('superagent');

var expect = chai.expect;
chai.use(require('dirty-chai'));
chai.use(require('chai-properties'));

describe('/link', () => {
  describe('e2e', () => {
    it('should create link', (done) => {
      var destUrl = 'https://google.com';
      var linkId;

      superagent
        .post('http://localhost:8080/links')
        .set('Accept', 'application/json')
        .timeout({
          response: 1000
        })
        .send({ url: destUrl })
        .end((err, postResponse) => {
          expect(err).to.not.exist();
          expect(postResponse.body).to.have.properties({
            'url': destUrl
          });

          linkId = postResponse.body.linkId;
          expect(linkId).to.exist();
          expect(postResponse.status).to.eql(201);

          superagent
            .get(`http://localhost:8080/links/${linkId}`)
            .set('Accept', 'application/json')
            .timeout({
              response: 1000
            })
            .redirects(0)
            .ok(res => res.status < 400)
            .end((err, getResponse) => {
              expect(err).to.not.exist();
              expect(getResponse.status).to.eql(302);

              expect(getResponse.headers).to.have.properties({
                'location': destUrl
              });

              done();
            });
        });
    });

    // TODO stub randomly generated string for collision tests
  });
});
