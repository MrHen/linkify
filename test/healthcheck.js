var chai = require('chai');
var superagent = require('superagent');

var expect = chai.expect;
chai.use(require('dirty-chai'));
chai.use(require('chai-properties'));

describe('/heathcheck', () => {
  it('should return healthcheck', (done) => {
    superagent
      .get('http://localhost:8080/healthcheck')
      .set('Accept', 'application/json')
      .end((err, result) => {  
        expect(err).to.not.exist();
        expect(result.body).to.have.properties({
            'message': 'healthcheck'
        });
        expect(result.status).to.eql(200);
        done();
      });
  });
});
