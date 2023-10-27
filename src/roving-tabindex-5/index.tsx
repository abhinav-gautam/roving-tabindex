import isHotkey from 'is-hotkey'
import { ComponentPropsWithoutRef } from 'react'

import { RovingTabindexRoot, useRovingTabindex } from './roving-tabindex';

type BaseButtonProps = {
    children: string
}

type ButtonProps = BaseButtonProps &
    Omit<ComponentPropsWithoutRef<'button'>, keyof BaseButtonProps>

export function Button(props: ButtonProps) {
    // Consuming custom hook
    const { getOrderedItems, getRovingProps } = useRovingTabindex(
        props.children,
    )
    return (
        <button
            // getRovingProps returns the props related to roving tabindex along with additionally supplied props
            {...getRovingProps<'button'>({

                onKeyDown: e => {

                    // Calling any keyDown handler supplied as prop
                    props?.onKeyDown?.(e)

                    // Main keyboard navigation goes here
                    if (isHotkey('right', e)) {

                        // Same approach, getting all the items, find next item and focus it
                        const items = getOrderedItems()
                        const currentIndex = items.findIndex(
                            item => item.element === e.currentTarget,
                        )
                        const nextItem = items.at(
                            currentIndex === items.length - 1
                                ? 0
                                : currentIndex + 1,
                        )

                        // NOTE - not setting focusableId as it is handled by the focus handler defined in getRovingProps
                        nextItem?.element.focus()
                    }
                },
                ...props,
            })}
        >
            {props.children}
        </button>
    )
}


export function ButtonGroup() {
    return (
        <RovingTabindexRoot as="div">
            <Button>button 1</Button>
            <Button>button 2</Button>
            <Button>button 3</Button>
        </RovingTabindexRoot>
    )
}
