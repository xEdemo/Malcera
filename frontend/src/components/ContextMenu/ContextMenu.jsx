const ContextMenu = ({ contextMenu }) => {
    return (
        <>
            {contextMenu.show && (
                <div
                    className="context-menu-main"
                    style={{
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                    }}
                >
                    <p>Context Menu</p>
                    <p>Hi</p>
                    <p>Bye &#8250;</p>
                    <p>ron</p>
                </div>
            )}
        </>
    );
};
export default ContextMenu;

// How to use:
// import { ContextMenu, useContextMenu } from '../../components'
// const { contextMenu, showContextMenu } = useContextMenu();
// Put <ContextMenu contextMenu={contextMenu} /> anywhere within return
// Put onContextMenu={showContextMenu} on any element that you want custom right click functionality for
