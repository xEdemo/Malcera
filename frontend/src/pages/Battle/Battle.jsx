import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    useGetExistingBattleQuery,
    usePerformActionOnMobMutation,
    useFleeFromMobMutation,
} from '../../slices/battle/battleApiSlice.js';
import {
    updateHealthPool,
    updateAttackXp,
    updateStrengthXp,
    updateDefenseXp,
    updateHitpointsXp,
    updateJossPaper,
    updateAttackLvl,
    updateStrengthLvl,
    updateDefenseLvl,
    updateHitpointsLvl,
} from '../../slices/user/userSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import calculateCombatLevel from '../../utils/combatLevel.js';

// Have a redirect if battle expires
const Battle = () => {
    const { battleId } = useParams();
    const { data, isLoading } = useGetExistingBattleQuery(battleId);

    const [updatedMobHealth, setUpdatedMobHealth] = useState();
    const [isAttackButtonDisabled, setIsAttackButtonDisabled] = useState(false);
    const [mobDamageOnUser, setMobDamageOnUser] = useState(null);
    const [userDamageOnMob, setUserDamageOnMob] = useState(null);

    const [attackMob, { isAttackError, attackError }] =
        usePerformActionOnMobMutation();

    const [flee, { isFleeError, fleeError }] = useFleeFromMobMutation();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.user);

    const userCL = calculateCombatLevel(
        userInfo?.attackLvl,
        userInfo?.defenseLvl,
        userInfo?.strengthLvl,
        userInfo?.hitpointsLvl
    );

    const handleAttack = async () => {
        setIsAttackButtonDisabled(true);
        if (data.battle) {
            try {
                const res = await attackMob(data?.battle?._id);
                //console.log(res);
                setMobDamageOnUser(res.data.mobDamage);
                setUserDamageOnMob(res.data.userDamage);
                const message = res.data.message;
                const updatedMobHealth = res.data.battle.mobHealth;
                const updatedUserHealth = res.data.user.healthPool;
                const updateAttXp = res.data.user.attackXp;
                const updateStrXp = res.data.user.strengthXp;
                const updateDefXp = res.data.user.defenseXp;
                const updateHpXp = res.data.user.hitpointsXp;
                const updateJoss = res.data.user.jossPaper;
                const resetHealth = res.data.user.hitpointsLvl * 10;
                const updateAttLvl = res.data.user.attackLvl;
                const updateStrLvl = res.data.user.strengthLvl;
                const updateDefLvl = res.data.user.defenseLvl;
                const updateHpLvl = res.data.user.hitpointsLvl;

                setUpdatedMobHealth(updatedMobHealth);
                dispatch(updateHealthPool(updatedUserHealth));

                if (updatedUserHealth < 9 && updatedUserHealth >= 1) {
                    toast.warning(`Your health is critically low.`);
                }
                if (updatedMobHealth <= 0) {
                    //console.log(res);
                    dispatch(updateAttackXp(updateAttXp));
                    dispatch(updateStrengthXp(updateStrXp));
                    dispatch(updateDefenseXp(updateDefXp));
                    dispatch(updateHitpointsXp(updateHpXp));
                    dispatch(updateJossPaper(updateJoss));
                    dispatch(updateAttackLvl(updateAttLvl));
                    dispatch(updateStrengthLvl(updateStrLvl));
                    dispatch(updateDefenseLvl(updateDefLvl));
                    dispatch(updateHitpointsLvl(updateHpLvl));
                    toast.success(`${message}`);
                    navigate(`/battle/inspect/${res.data.battle.mob}`);
                } else if (res.data.healthAfter <= 0) {
                    dispatch(updateJossPaper(updateJoss));
                    dispatch(updateHealthPool(resetHealth));
                    toast.error(`${message}`);
                    navigate(`/game`);
                }
                setTimeout(async () => {
                    setIsAttackButtonDisabled(false);
                }, 500);
            } catch (err) {
                toast.error(
                    `An error occurred when performing an attack. Please try again shortly.`
                );
            }
        }
    };

    const handleFlee = async () => {
        try {
            if(data.battle){
                const res = await flee(data?.battle?._id);
                console.log(res);
                const updateJoss = res.data.user.jossPaper;
                dispatch(updateJossPaper(updateJoss));
                navigate(`/battle/inspect/${res.data.battle.mob}`);
            }
        } catch (err) {
            toast.error(
                `An error occurred when attempting to flee. Please try again shortly.`
            );
        }
    } 

    return (
        <div
            style={{
                display: 'flex',
                gap: '5rem',
                position: 'relative',
            }}
        >
            {isLoading && <div>Loading...</div>}
            <button
                onClick={handleFlee}
                style={{ backgroundColor: 'var(--theme-red-600)' }}
            >
                Flee
            </button>
            {mobDamageOnUser !== null &&
                mobDamageOnUser !== 0 &&
                mobDamageOnUser !== undefined && (
                    <p
                        style={{
                            position: 'absolute',
                            left: '0%',
                        }}
                    >
                        -{mobDamageOnUser}
                    </p>
                )}
            {(mobDamageOnUser === 0 || mobDamageOnUser === undefined) && (
                <p
                    style={{
                        position: 'absolute',
                        left: '0%',
                        backgroundColor: 'green',
                    }}
                >
                    0
                </p>
            )}
            <div>
                <h2>
                    {userInfo?.username} (CL {userCL})
                </h2>
                <h4>Hp: {userInfo?.healthPool}</h4>
                <h4>Atk XP: {userInfo?.attackXp}</h4>
                <h4>Str XP: {userInfo?.strengthXp}</h4>
                <h4>Def XP: {userInfo?.defenseXp}</h4>
                <h4>Hp XP: {userInfo?.hitpointsXp}</h4>
                <h4>Joss: {userInfo?.jossPaper}</h4>
            </div>
            {isAttackButtonDisabled ? (
                <button type="button" className="button-loading">
                    <span className="button-text-hidden">Attack</span>
                </button>
            ) : (
                <button type="button" onClick={handleAttack}>
                    Attack
                </button>
            )}
            {userDamageOnMob !== null &&
                userDamageOnMob !== 0 &&
                userDamageOnMob !== undefined && (
                    <p
                        style={{
                            position: 'absolute',
                            right: '0%',
                        }}
                    >
                        -{userDamageOnMob}
                    </p>
                )}
            {(userDamageOnMob === 0 || userDamageOnMob === undefined) && (
                <p
                    style={{
                        position: 'absolute',
                        right: '0%',
                        backgroundColor: 'green',
                    }}
                >
                    0
                </p>
            )}
            <div>
                <h2>{data?.battle?.name}</h2>
                <h4>Hp: {updatedMobHealth || data?.battle?.mobHealth}</h4>
            </div>
        </div>
    );
};
export default Battle;
