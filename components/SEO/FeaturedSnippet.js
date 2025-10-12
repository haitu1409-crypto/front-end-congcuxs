/**
 * Featured Snippet Component
 * Optimized format for Google Position #0
 */

import { memo } from 'react';
import styles from './FeaturedSnippet.module.css';

/**
 * Direct Answer Format (for "What is" questions)
 */
const DirectAnswer = memo(function DirectAnswer({ question, answer }) {
    return (
        <div className={styles.directAnswer} itemScope itemType="https://schema.org/Question">
            <h2 className={styles.question} itemProp="name">{question}</h2>
            <div className={styles.answerBox} itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p className={styles.answer} itemProp="text">
                    {answer}
                </p>
            </div>
        </div>
    );
});

/**
 * List Format (for "How to" questions)
 */
const ListSnippet = memo(function ListSnippet({ title, items, ordered = true }) {
    const ListTag = ordered ? 'ol' : 'ul';

    return (
        <div className={styles.listSnippet}>
            <h2 className={styles.listTitle}>{title}</h2>
            <ListTag className={styles.featuredList}>
                {items.map((item, index) => (
                    <li key={index} className={styles.listItem}>
                        {item.label && <strong>{item.label}: </strong>}
                        {item.text}
                    </li>
                ))}
            </ListTag>
        </div>
    );
});

/**
 * Table Format (for comparisons)
 */
const TableSnippet = memo(function TableSnippet({ title, headers, rows }) {
    return (
        <div className={styles.tableSnippet}>
            <h2 className={styles.tableTitle}>{title}</h2>
            <div className={styles.tableWrapper}>
                <table className={styles.comparisonTable}>
                    <thead>
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

/**
 * Definition Format (for terminology)
 */
const DefinitionSnippet = memo(function DefinitionSnippet({ term, definition, examples }) {
    return (
        <div className={styles.definition} itemScope itemType="https://schema.org/DefinedTerm">
            <h3 className={styles.term} itemProp="name">{term}</h3>
            <p className={styles.definitionText} itemProp="description">
                {definition}
            </p>
            {examples && examples.length > 0 && (
                <div className={styles.examples}>
                    <strong>Ví dụ:</strong>
                    <ul>
                        {examples.map((example, index) => (
                            <li key={index}>{example}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
});

// Named exports
export { DirectAnswer, ListSnippet, TableSnippet, DefinitionSnippet };

// Default export
export default DirectAnswer;

