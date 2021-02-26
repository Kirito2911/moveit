import {createContext, ReactNode, useEffect, useState} from 'react';
import challenges from "../../challenges.json";
import Cookies from 'js-cookie';
import { LevelUpModal } from '../components/LevelUpModal';

interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number;
}

interface ChallengesContextData {
    level:number;
    currentExperience: number;
    challengesCompleted: number;
    levelUp: () => void;
    startNewChallenge: () => void;
    resetChallenge: () => void;
    experienceToNextLevel: number;
    activeChallenge: Challenge;
    completeChallenge: () => void;
    closeLevelUpModal:() => void;
}

interface ChallengesProviderProps {
    children: ReactNode;
    level: number;
    currentExperience: number;
    challengesCompleted: number; 
}

export const ChallengesContext = createContext ({} as ChallengesContextData);

export function ChallengesProvider({children, ...rest}:ChallengesProviderProps){
    const [level, setLevel] = useState(rest.level);
    const [currentExperience, setCurrentExperience] = useState(rest.currentExperience);
    const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted);
    const [activeChallenge, setActiveChallenge]= useState(null);
    const [isLEvelUpModalOpen, setisLEvelUpModalOpen] = useState(false);
    
    const experienceToNextLevel = Math.pow((level+1)*4,2);

    useEffect(() => {
        Notification.requestPermission();
    }, [])

    function levelUp(){
        setLevel(level+1);
        setisLEvelUpModalOpen(true);
    }
    
    useEffect(() => {
        Cookies.set('level', String(level));
        Cookies.set('currentExperience', String(currentExperience));
        Cookies.set('challengesCompleted', String(challengesCompleted));
    }, [level,currentExperience, challengesCompleted]);

    function startNewChallenge(){
        const randomChallengeIndex = Math.floor(Math.random() * challenges.length);
        const challenge = challenges[randomChallengeIndex];
        setActiveChallenge(challenge);
        new Audio('/notification.mp3').play();
        if(Notification.permission === 'granted'){
            new Notification('Novo desafio 🏋️‍♂️🏆🥇', {
                body:`Valendo ${challenge.amount} xp!`
            })
        }

    }

    function closeLevelUpModal(){
        setisLEvelUpModalOpen(false);
    }

    function resetChallenge(){
        setActiveChallenge(null);
    }

    function completeChallenge(){
        if(!activeChallenge){
            return;
        }

        const {amount} = activeChallenge;
        
        let finalExperience = currentExperience + amount;

        if( finalExperience >= experienceToNextLevel){
            finalExperience = finalExperience - experienceToNextLevel;
            levelUp();
        }

        setCurrentExperience(finalExperience);
        setActiveChallenge(null);
        setChallengesCompleted(challengesCompleted+1);
    }

    return(
        <ChallengesContext.Provider value={{level, 
        currentExperience,
        startNewChallenge,
        levelUp,
        challengesCompleted,
        resetChallenge,
        completeChallenge,
        experienceToNextLevel,
        closeLevelUpModal,
        activeChallenge}}>
            {children}
            {isLEvelUpModalOpen && <LevelUpModal/>}
        </ChallengesContext.Provider>
    );
}