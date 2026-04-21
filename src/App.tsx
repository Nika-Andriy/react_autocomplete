import React, { useEffect, useState } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';

type Person = {
  name: string;
  born: number;
  died: number;
};

type Props = {
  debounceDelay?: number;
  onSelected?: (person: Person) => void;
};

export const App: React.FC<Props> = ({ debounceDelay = 300, onSelected }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Person[]>(peopleFromServer);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const filteredPeople = (value: string) => {
    const q = value.trim().toLowerCase();

    if (!q) {
      return peopleFromServer;
    }

    return peopleFromServer.filter(person =>
      person.name.toLowerCase().includes(q),
    );
  };

  const showTitle = ({ name, born, died }: Person) =>
    `${name} (${born} - ${died})`;

  // ✅ debounce + filtering (SINGLE SOURCE OF TRUTH)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuggestions(filteredPeople(query));
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [query, debounceDelay]);

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {selectedPerson ? showTitle(selectedPerson) : 'No selected person'}
        </h1>

        <div className={`dropdown ${isOpen ? 'is-active' : ''}`}>
          <div className="dropdown-trigger">
            <input
              type="text"
              className="input"
              placeholder="Enter a part of the name"
              data-cy="search-input"
              value={query}
              onFocus={() => {
                setIsOpen(true);

                if (!query.trim()) {
                  setSuggestions(peopleFromServer);
                }
              }}
              onChange={e => {
                setQuery(e.target.value);
                setSelectedPerson(null);
              }}
            />
          </div>

          <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
            <div className="dropdown-content">
              {suggestions.map(person => (
                <a
                  key={person.name}
                  className="dropdown-item"
                  data-cy="suggestion-item"
                  onMouseDown={() => {
                    setSelectedPerson(person);
                    setQuery(person.name);
                    setIsOpen(false);

                    onSelected?.(person);
                  }}
                >
                  {person.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {suggestions.length === 0 && (
          <div
            className="
              notification
              is-danger
              is-light
              mt-3
              is-align-self-flex-start
            "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
