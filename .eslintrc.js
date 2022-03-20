module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es2021': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 'latest'
    },
    'rules': {
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'prefer-const': ['error'],
        'no-var': ['error'],
    }
};