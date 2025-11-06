import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
    ...next,
    ...nextCoreWebVitals,
    {
        name: "project-overrides",
        settings: {
            next: {
                rootDir: ["./"],
            },
        },
        rules: {
            "react-hooks/rules-of-hooks": "off",
            "react-hooks/exhaustive-deps": "warn",
            "react-hooks/purity": "off",
            "react-hooks/refs": "off",
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/immutability": "off",
            "react/no-unescaped-entities": "off",
            "react/display-name": "off",
            "import/no-anonymous-default-export": "off",
            "@next/next/no-html-link-for-pages": "off",
        },
    },
];