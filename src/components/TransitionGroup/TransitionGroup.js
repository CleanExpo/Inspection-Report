import React from 'react';
import { TransitionGroup as ReactTransitionGroup, CSSTransition } from 'react-transition-group';
import styles from './TransitionGroup.module.css';

export default function AnimatedList({ items, renderItem }) {
  return (
    <ReactTransitionGroup className={styles.transitionGroup}>
      {items.map((item) => (
        <CSSTransition
          key={item.id}
          timeout={300}
          classNames={{
            enter: styles.itemEnter,
            enterActive: styles.itemEnterActive,
            exit: styles.itemExit,
            exitActive: styles.itemExitActive,
          }}
        >
          <div className={styles.item} key={item.id}>
            {renderItem(item)}
          </div>
        </CSSTransition>
      ))}
    </ReactTransitionGroup>
  );
}
