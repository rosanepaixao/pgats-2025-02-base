const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const app = require('../../../graphql/app');

describe('Fluxo de Checkout - API GraphQL', () => {
    let token;

    before(async () => {

        const registerPayload = require(path.join(__dirname, '../fixture/requests/registerGraphQL.json'));
        await request(app).post('/graphql').send(registerPayload);

        const loginPayload = require(path.join(__dirname, '../fixture/requests/loginGraphQL.json'));
        const response = await request(app).post('/graphql').send(loginPayload);

        expect(response.body.data, 'A resposta do login não deve ser nula').to.not.be.null;
        expect(response.body.data.login, 'O login não deve ser nulo').to.not.be.null;

        token = response.body.data.login.token;
        expect(token).to.be.a('string');
    });

    it('Deve buscar a lista de usuários via query', async () => {
        const usersQueryPayload = require(path.join(__dirname, '../fixture/requests/usersQueryGraphQL.json'));
        const response = await request(app)
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send(usersQueryPayload);

        expect(response.status).to.equal(200);
        expect(response.body.data.users).to.be.an('array');
        expect(response.body.data.users.length).to.be.greaterThan(0);
    });

    it('Deve realizar um checkout com cartão de crédito via mutation', async () => {
        const checkoutPayload = require(path.join(__dirname, '../fixture/requests/checkoutCartaoGraphQL.json'));
        const response = await request(app)
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send(checkoutPayload);

        expect(response.status).to.equal(200);
        const checkoutData = response.body.data.checkout;
        expect(checkoutData).to.not.be.null;
        expect(checkoutData).to.have.property('valorFinal');
        expect(checkoutData.valorFinal).to.equal(204.25);
    });

    it('Deve realizar um checkout com boleto via mutation', async () => {
        const checkoutBoletoPayload = {
            query: `
                mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!) {
                    checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod) {
                        userId
                        valorFinal
                    }
                }
            `,
            variables: {
                items: [{ "productId": 1, "quantity": 2 }],
                freight: 20,
                paymentMethod: "boleto"
            }
        };

        const response = await request(app)
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send(checkoutBoletoPayload);

        expect(response.status).to.equal(200);
        const checkoutData = response.body.data.checkout;
        expect(checkoutData).to.not.be.null;
        expect(checkoutData).to.have.property('valorFinal');
        expect(checkoutData.valorFinal).to.equal(220);
    });
});

