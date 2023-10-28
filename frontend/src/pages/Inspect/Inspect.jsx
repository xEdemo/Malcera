import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useInspectMobQuery,
    useCreateBattleInstanceMutation,
} from '../../slices/battle/battleApiSlice.js';
import { toast } from 'react-toastify';
import axios from 'axios';

const Inspect = () => {
    const { mobId } = useParams();
    const { data, isLoading } = useInspectMobQuery(mobId);
    const [isAttackChecked, setIsAttackChecked] = useState(true);
    const [isStrengthChecked, setIsStrengthChecked] = useState(true);
    const [isDefenseChecked, setIsDefenseChecked] = useState(true);
    const [isHitpointsChecked, setIsHitpointsChecked] = useState(true);

    useEffect(() => {
        const data = JSON.parse(
            localStorage.getItem('CHECKBOX_STATES_FOR_STATS')
        );

        if (data) {
            setIsAttackChecked(data.isAttackChecked);
            setIsStrengthChecked(data.isStrengthChecked);
            setIsDefenseChecked(data.isDefenseChecked);
            setIsHitpointsChecked(data.isHitpointsChecked);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            'CHECKBOX_STATES_FOR_STATS',
            JSON.stringify({
                isAttackChecked,
                isStrengthChecked,
                isDefenseChecked,
                isHitpointsChecked,
            })
        );
    }, [
        isAttackChecked,
        isStrengthChecked,
        isDefenseChecked,
        isHitpointsChecked,
    ]);

    const [createInstance, { isError, error }] =
        useCreateBattleInstanceMutation();

    const navigate = useNavigate();

    const handleClick = async () => {
        try {
            if (data?.mob) {
                await updateSkillsStatusToBackend();
                const res = await createInstance(data.mob._id);
                //console.log('Response:', res?.data?.battle);
                navigate(`/battle/${res?.data?.battle?._id}`);
            } else {
                toast.error('Data or data.mob is undefined.');
            }
        } catch (err) {
            console.error('Error while handling click:', err);
            toast.error('Failed to create battle instance.');
        }
    };

    const handleCheckboxChange = async (checkboxName, isChecked) => {
        // Update the local state based on the checkbox changes
        switch (checkboxName) {
            case 'Attack':
                setIsAttackChecked(isChecked);
                break;
            case 'Strength':
                setIsStrengthChecked(isChecked);
                break;
            case 'Defense':
                setIsDefenseChecked(isChecked);
                break;
            case 'Hitpoints':
                setIsHitpointsChecked(isChecked);
                break;
            default:
                break;
        }
    };

    const updateSkillsStatusToBackend = async () => {
        const settingsData = {
            isAttackChecked,
            isStrengthChecked,
            isDefenseChecked,
            isHitpointsChecked,
        };

        try {
            // Make the API call using axios and set custom headers
            if (data?.mob) {
                await axios.post(`/api/v1/battle/${mobId}`, settingsData, {
                    headers: {
                        isAttackChecked: settingsData.isAttackChecked,
                        isStrengthChecked: settingsData.isStrengthChecked,
                        isDefenseChecked: settingsData.isDefenseChecked,
                        isHitpointsChecked: settingsData.isHitpointsChecked,
                    },
                });
            }
        } catch (error) {
            // Handle any errors here
            console.error('Error updating skills status:', error);
        }
    };

    return (
        <div>
            {isLoading && <div>Loading...</div>}
            {isError && <div>Error: Failed to create battle instance.</div>}
            <h2>
                {data?.mob?.name} (CL {data?.mob?.combatLevel})
            </h2>
            <h4>Atk Lvl: {data?.mob?.attackLvl}</h4>
            <h4>Str Lvl: {data?.mob?.strengthLvl}</h4>
            <h4>Def Lvl: {data?.mob?.defenseLvl}</h4>
            <h4>Hp: {data?.mob?.healthPool}</h4>
            <button type="button" onClick={handleClick}>
                Fight
            </button>
            <label htmlFor="attackXpChoice">Attack</label>
            <input
                type="checkbox"
                value="Attack"
                id="attackXpChoice"
                checked={isAttackChecked}
                onChange={(e) =>
                    handleCheckboxChange('Attack', e.target.checked)
                }
            />
            <label htmlFor="strengthXpChoice">Strength</label>
            <input
                type="checkbox"
                value="Strength"
                id="strengthXpChoice"
                checked={isStrengthChecked}
                onChange={(e) =>
                    handleCheckboxChange('Strength', e.target.checked)
                }
            />
            <label htmlFor="defenseXpChoice">Defense</label>
            <input
                type="checkbox"
                value="Defense"
                id="defenseXpChoice"
                checked={isDefenseChecked}
                onChange={(e) =>
                    handleCheckboxChange('Defense', e.target.checked)
                }
            />
            <label htmlFor="hitpointsXpChoice">Hitpoints</label>
            <input
                type="checkbox"
                value="Hitpoints"
                id="hitpointsXpChoice"
                checked={isHitpointsChecked}
                onChange={(e) =>
                    handleCheckboxChange('Hitpoints', e.target.checked)
                }
            />
        </div>
    );
};
export default Inspect;
