const sinon = require('sinon');
const { expect } = require('chai');
const userController = require('../../rest/controllers/userController');
const userService = require('../../src/services/userService');

describe('User Controller - Unit Tests', () => {
    let req, res, sandbox, statusStub, jsonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        req = {
            body: {}
        };
        res = {
            status: () => res,
            json: () => res
        };

        statusStub = sandbox.stub(res, 'status').returns(res);
        jsonStub = sandbox.stub(res, 'json');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('register', () => {
        it('deve registrar um usuário com sucesso e retornar status 201', () => {
            req.body = { name: 'Teste', email: 'rosane@email.com', password: '123456' };
            const newUser = { name: 'Teste', email: 'rosane@email.com' };

            sandbox.stub(userService, 'registerUser').returns(newUser);

            userController.register(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonStub.calledWith({ user: newUser })).to.be.true;
        });

        it('deve retornar erro 400 se o email já estiver cadastrado', () => {
            req.body = { name: 'Rosane', email: 'rosane@email.com', password: '123456' };

            sandbox.stub(userService, 'registerUser').returns(null);
            userController.register(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ error: 'Email já cadastrado' })).to.be.true;
        });
    });

    describe('login', () => {
        it('deve autenticar o usuário e retornar o token', () => {
            req.body = { email: 'rosane@mail.com', password: '123456' };
            const authResult = { token: 'fake-jwt-token' };

            sandbox.stub(userService, 'authenticate').returns(authResult);

            userController.login(req, res);

            expect(jsonStub.calledWith(authResult)).to.be.true;
        });

        it('deve retornar erro 401 para credenciais inválidas', () => {
            req.body = { email: 'rosane@mail.com', password: '123456' };

            sandbox.stub(userService, 'authenticate').returns(null);

            userController.login(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
            expect(jsonStub.calledWith({ error: 'Credenciais inválidas' })).to.be.true;
        });
    });
});