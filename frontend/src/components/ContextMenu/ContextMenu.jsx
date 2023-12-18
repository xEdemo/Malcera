import { memo, useState, useEffect, useReducer } from 'react';
import { useSplitStackMutation } from '../../slices/inventory/inventoryApiSlice.js';
import { toast } from 'react-toastify';

const ContextMenu = ({
    contextMenu,
    itemName,
    splitStackableItem,
    checkOriginalQuantity,
    index,
    rerenderInventory,
}) => {
    const [splitAmount, setSplitAmount] = useState(1);
    const [isSplitting, setIsSplitting] = useState(false);
    const [splitStack] = useSplitStackMutation();

    const handleSplitStack = async () => {
        try {
            const res = await splitStack({
                index: index,
                amount: splitAmount,
            });
            if (res.data) {
                rerenderInventory();
            }
        } catch (err) {
            toast.error('Error splitting stack.');
        } finally {
            // Reset the state after the split is complete
            setIsSplitting(false);
        }
    };

    const handleSliderChange = (e) => {
        setSplitAmount(Number(e.target.value));
    };

    const handleInputChange = (e) => {
        const value = Number(e.target.value);
        if (
            value === '' ||
            (!isNaN(value) && value >= 0 && value <= checkOriginalQuantity)
        ) {
            setSplitAmount(value === '' ? 1 : Number(value));
        }
    };

    // useEffect(() => {
    //     if (isSplitting) {

    //     }
    // }, [isSplitting]);

    useEffect(() => {
        setSplitAmount(Math.floor(checkOriginalQuantity / 2));
    }, [checkOriginalQuantity]);

    return (
        <>
            {contextMenu.show && (
                <div
                    className={`context-menu-main ${
                        splitStackableItem ? 'stackable' : ''
                    } ${checkOriginalQuantity > 1 ? '' : 'non-splitable'}`}
                    style={{
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                    }}
                >
                    <p>Context Menu</p>
                    {itemName && <p>{itemName}</p>}
                    {splitStackableItem && checkOriginalQuantity > 1 && (
                        <p onClick={() => setIsSplitting(true)}>Split</p>
                    )}
                    <p>Bye &#8250;</p>
                </div>
            )}
            {isSplitting && (
                <div className="split-context-menu">
                    <label htmlFor="splitAmount">
                        Split Amount:{' '}
                        <input
                            type="number"
                            min={1}
                            max={checkOriginalQuantity}
                            step={1}
                            value={splitAmount === 0 ? '' : splitAmount}
                            onChange={handleInputChange}
                        />
                    </label>
                    <input
                        type="range"
                        id="splitAmount"
                        name="splitAmount"
                        min={1}
                        max={checkOriginalQuantity} // Adjust the max value based on your requirements
                        value={splitAmount === 0 ? '' : splitAmount}
                        onChange={handleSliderChange}
                    />
                    <button onClick={() => setIsSplitting(false)}>Close</button>
                    <button onClick={handleSplitStack}>Confirm</button>
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
