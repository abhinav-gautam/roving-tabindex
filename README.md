# Roving Tabindex

Inspired from [roving tabindex](https://www.joshuawootonn.com/react-roving-tabindex) created by Josh Woontonn.

## Topics

-   Basic Implementation
    -   Taking elements from list
    -   Taking elements from DOM
    -   From Props to Context
    -   Setting up tab and shift tab
    -   Implementing reusability
-   Advanced Implementation
    -   Creating wrapper component for items
    -   Implementing all the keyboard navigation
    -   Adding support for Data and Layout grids
    -   Adding various focus states for item, like disabled, children and container.
    -   Decoupling keyboard navigation functionalities as utility

## Basic Implementation

### Taking elements from the list

Code in `roving-tabindex-1`

Here we take the elements from the hardcoded state.

Drawback - Elements are stored in an state, need to take elements from DOM

### Taking elements from DOM

Code in `roving-tabindex-2`

Here we start taking the elements from the DOM using querySelector and custom attribute.

Drawback - Tightly coupled

### From Props to Context

Code in `roving-tabindex-3`

Here we have moved the props accepted by the Button component into a context. Also separated the functionality of onKeyDown:

1. It gets a list of items from the DOM - orchestrated as function in ButtonGroup component
2. It uses list of items to implement actual keyboard navigation - moved to Button component

We have also created a function `getOrderedItems` in ButtonGroup to get items from the DOM and placed in the context

Drawback - Decoupled but not much reusable. focusableId initial state is hardcoded

### Setting up tab and shift tab

Code in `roving-tabindex-4`

In previous implementation focusableId initial state is hardcoded which is not very reusable. But if we don't initialize it all our buttons will have `tabindex={-1}`. This will prevent the focus from entering the group and `onKeyDown` will never be fired.

To fix this issue we have added focus handler for the wrapper div, which will focus the previously focused button or the first button.

This introduces another issue with the shit tabbing, hitting `shit+tab` moves the focus to the wrapper div, and its `onFocus` then passes the focus back to the child node.

To fix this we can toggle the `tabindex` of our wrapper div between the `onKeyDown` of our Button and the onBlur of our ButtonGroup

### Implementing reusability

Code in `roving-tabindex-5`

Previous implementation was fine but was not reusable as lot of logic related to roving tabindex was still inside the components.

For reusability we move everything in our button that is related to roving tabindex into a custom hook called `useRovingTabindex`.

Also, we have refactored the ButtonGroup component to a much reusable polymorphic wrapper component called `RovingTabindexRoot`.
