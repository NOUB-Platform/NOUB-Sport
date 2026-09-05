/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/utils/newsEngine.js
 * Version: Noub Sports_beta 0.0.2 (PRESS ENGINE)
 * Status: Production Ready
 */

export class NewsEngine {
    static generateReport(teamA, teamB, scoreA, scoreB) {
        const diff = Math.abs(scoreA - scoreB);
        const totalGoals = scoreA + scoreB;
        const winner = scoreA > scoreB ? teamA : (scoreB > scoreA ? teamB : null);
        const loser = scoreA > scoreB ? teamB : (scoreB > scoreA ? teamA : null);

        if (scoreA === scoreB) {
            return this._handleDraw(teamA, teamB, scoreA);
        } else if (diff >= 3) {
            return this._handleThrashing(winner, loser, scoreA, scoreB);
        } else if (diff === 1 && totalGoals > 5) {
            return this._handleThriller(winner, loser, scoreA, scoreB);
        } else if (scoreB > scoreA && scoreA === 0) {
            return this._handleCleanSheetWin(winner, loser, scoreB);
        } else if (scoreA > scoreB && scoreB === 0) {
            return this._handleCleanSheetWin(winner, loser, scoreA);
        } else {
            return this._handleStandardWin(winner, loser, scoreA, scoreB);
        }
    }

    static _handleDraw(teamA, teamB, score) {
        if (score === 0) {
            return {
                headline: "شباك نظيفة وتعادل تكتيكي",
                body: `سيطر الحذر على لقاء ${teamA} و ${teamB}، حيث فشل المهاجمون في فك شفرة الدفاعات لتنتهي المباراة بلا أهداف.`,
                mood: 'NEUTRAL'
            };
        } else if (score >= 3) {
            return {
                headline: "مهرجان أهداف ينتهي حبايب!",
                body: `مباراة مجنونة شهدت ${score * 2} هدفاً! تبادل ${teamA} و ${teamB} الهجمات طوال المباراة ولم يستطع أحدهما حسم النتيجة.`,
                mood: 'EXCITING'
            };
        } else {
            return {
                headline: "التعادل يحسم ديربي المنطقة",
                body: `نقطة لكل فريق بعد مباراة متكافئة بين ${teamA} و ${teamB}.`,
                mood: 'NEUTRAL'
            };
        }
    }

    static _handleThrashing(winner, loser, sA, sB) {
        return {
            headline: `طوفان ${winner} يغرق ${loser}!`,
            body: `في ليلة كروية مثيرة، فرض فريق ${winner} سيطرته واكتسح خصمه ${loser} بنتيجة ثقيلة قوامها ${Math.max(sA, sB)} أهداف.`,
            mood: 'DOMINANT'
        };
    }

    static _handleThriller(winner, loser, sA, sB) {
        return {
            headline: "موقعة تكسير عظام حتى الدقيقة الأخيرة!",
            body: `خطف ${winner} فوزاً درامياً من أنياب ${loser} في مباراة حبست الأنفاس وشهدت غزارة تهديفية متبادلة.`,
            mood: 'INTENSE'
        };
    }

    static _handleCleanSheetWin(winner, loser, winnerScore) {
        return {
            headline: `${winner} يغلق مرماه ويخطف نقاط المباراة`,
            body: `بأداء دفاعي صلب وفاعلية هجومية، نجح ${winner} في الفوز على ${loser} بنتيجة ${winnerScore} مقابل لا شيء.`,
            mood: 'SOLID'
        };
    }

    static _handleStandardWin(winner, loser, sA, sB) {
        return {
            headline: `${winner} يفرض كلمته على ${loser}`,
            body: `حقق فريق ${winner} انتصاراً مستحقاً على ${loser} وحصد نقاط المباراة كاملة بعد أداء قوي.`,
            mood: 'POSITIVE'
        };
    }
}
