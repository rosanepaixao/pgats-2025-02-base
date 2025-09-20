const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();


const app = require('../../../rest/app');

describe('Fluxo de Checkout - API REST', () => {
    let token;

    before(async () => {
        const loginData = require('../fixture/requests/loginRest.json');

        const response = await request(app)
            .post('/api/users/login')
            .send(loginData);

        token = response.body.token;
        expect(token).to.be.a('string');
    });

    it('Deve realizar um checkout com boleto com sucesso', async () => {
        const checkoutData = require('../fixture/requests/checkoutBoletoRest.json');

        const response = await request(app)
            .post('/api/checkout')
            .set('Authorization', `Bearer ${token}`)
            .send(checkoutData);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('total');
        expect(response.body.total).to.equal(220);
    });

    it('Deve realizar um checkout com cartão de crédito e aplicar 5% de desconto', async () => {
        const checkoutData = require('../fixture/requests/checkoutCartaoRest.json');

        const response = await request(app)
            .post('/api/checkout')
            .set('Authorization', `Bearer ${token}`)
            .send(checkoutData);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('total');
        expect(response.body.total).to.equal(204.25);
    });

    it('Deve retornar erro 401 ao tentar fazer checkout sem token', async () => {
        const checkoutData = require('../fixture/requests/checkoutBoletoRest.json');

        const response = await request(app)
            .post('/api/checkout')
            .send(checkoutData);

        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('error', 'Token inválido');
    });
});

