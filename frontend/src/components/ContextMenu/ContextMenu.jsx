import { memo } from 'react';

const ContextMenu = ({ contextMenu, itemName, splitStackableItem }) => {
    return (
        <>
            {contextMenu.show && (
                <div
                    className={`context-menu-main ${
                        splitStackableItem ? 'stackable' : ''
                    }`}
                    style={{
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                    }}
                >
                    <p>Context Menu</p>
                    {itemName && <p>{itemName}</p>}
                    {splitStackableItem && <p>Split</p>}
                    <p>Bye &#8250;</p>
                </div>
            )}
        </>
    );
};
export default memo(ContextMenu);

// How to use:
// import { ContextMenu, useContextMenu } from '../../components'
// const { contextMenu, showContextMenu } = useContextMenu();
// Put <ContextMenu contextMenu={contextMenu} /> anywhere within return
// Put onContextMenu={showContextMenu} on any element that you want custom right click functionality for
