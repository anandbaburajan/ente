import config from "ente-build-config/eslintrc-base.mjs";

export default [
    ...config,
    { ignores: ["playwright-report/**", "test-results/**"] },
    {
        rules: {
            "no-empty-pattern": [
                "error",
                { allowObjectPatternsAsParameters: true },
            ],
        },
    },
];
