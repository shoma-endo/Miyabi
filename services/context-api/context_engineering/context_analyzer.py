import logging
import re
import json
from typing import Dict, Any
from datetime import datetime
import google.generativeai as genai
from collections import Counter
import statistics

from context_models import (
    ContextWindow, ContextAnalysis,
    ContextQuality
)

logger = logging.getLogger(__name__)

class ContextAnalyzer:
    """コンテキスト分析エンジン"""
    
    def __init__(self, gemini_api_key: str):
        genai.configure(api_key=gemini_api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
    async def analyze_context_window(self, window: ContextWindow) -> ContextAnalysis:
        """コンテキストウィンドウの包括的分析"""
        
        analysis = ContextAnalysis(
            context_id=window.id,
            analysis_type="comprehensive"
        )
        
        # 基本メトリクス計算
        basic_metrics = self._calculate_basic_metrics(window)
        analysis.metrics.update(basic_metrics)
        
        # 構造分析
        structure_analysis = self._analyze_structure(window)
        analysis.metrics.update(structure_analysis)
        
        # 意味的一貫性分析
        semantic_analysis = await self._analyze_semantic_consistency(window)
        analysis.metrics.update(semantic_analysis["metrics"])
        analysis.insights.extend(semantic_analysis["insights"])
        
        # トークン効率性分析
        efficiency_analysis = self._analyze_token_efficiency(window)
        analysis.metrics.update(efficiency_analysis)
        
        # 品質評価
        quality_assessment = await self._assess_quality(window, analysis.metrics)
        analysis.quality_score = quality_assessment["score"]
        analysis.issues.extend(quality_assessment["issues"])
        analysis.strengths.extend(quality_assessment["strengths"])
        analysis.recommendations.extend(quality_assessment["recommendations"])
        
        return analysis
    
    def _calculate_basic_metrics(self, window: ContextWindow) -> Dict[str, float]:
        """基本メトリクス計算"""
        if not window.elements:
            return {
                "total_elements": 0,
                "total_tokens": 0,
                "avg_element_length": 0,
                "token_utilization": 0
            }
        
        element_lengths = [len(elem.content) for elem in window.elements]
        
        return {
            "total_elements": len(window.elements),
            "total_tokens": window.current_tokens,
            "avg_element_length": statistics.mean(element_lengths),
            "max_element_length": max(element_lengths),
            "min_element_length": min(element_lengths),
            "token_utilization": window.utilization_ratio,
            "available_tokens": window.available_tokens
        }
    
    def _analyze_structure(self, window: ContextWindow) -> Dict[str, float]:
        """構造分析"""
        if not window.elements:
            return {}
        
        # 要素タイプの分布
        type_counts = Counter(elem.type.value for elem in window.elements)
        total_elements = len(window.elements)
        
        # 優先度分析
        priorities = [elem.priority for elem in window.elements]
        
        # 時系列分析
        creation_times = [elem.created_at for elem in window.elements]
        time_span = (max(creation_times) - min(creation_times)).total_seconds() if len(creation_times) > 1 else 0
        
        return {
            "type_diversity": len(type_counts) / max(len(type_counts), 1),
            "avg_priority": statistics.mean(priorities),
            "priority_std": statistics.stdev(priorities) if len(priorities) > 1 else 0,
            "time_span_hours": time_span / 3600,
            "system_ratio": type_counts.get("system", 0) / total_elements,
            "user_ratio": type_counts.get("user", 0) / total_elements,
            "assistant_ratio": type_counts.get("assistant", 0) / total_elements
        }
    
    async def _analyze_semantic_consistency(self, window: ContextWindow) -> Dict[str, Any]:
        """意味的一貫性分析"""
        if not window.elements:
            return {"metrics": {}, "insights": []}
        
        try:
            # コンテキスト要素をテキストとして結合
            context_text = "\n\n".join([
                f"[{elem.type.value}] {elem.content}" 
                for elem in window.elements
            ])
            
            prompt = f"""
            以下のコンテキストの意味的一貫性を分析してください:

            {context_text}

            以下の観点で分析してください:
            1. 話題の一貫性（0-1スコア）
            2. 論理的流れ（0-1スコア）
            3. 情報の重複度（0-1スコア、1が高重複）
            4. 文脈の明確性（0-1スコア）
            5. 目的との整合性（0-1スコア）

            また、以下の洞察を提供してください:
            - 主要なテーマや話題
            - 潜在的な問題点
            - 改善提案

            JSON形式で回答してください:
            {{
                "metrics": {{
                    "topic_consistency": 0.8,
                    "logical_flow": 0.7,
                    "information_redundancy": 0.3,
                    "context_clarity": 0.9,
                    "goal_alignment": 0.8
                }},
                "insights": [
                    "主要テーマは...",
                    "改善点は..."
                ]
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            
            return result
            
        except Exception as e:
            logger.error(f"Semantic analysis failed: {str(e)}")
            return {
                "metrics": {
                    "topic_consistency": 0.5,
                    "logical_flow": 0.5,
                    "information_redundancy": 0.5,
                    "context_clarity": 0.5,
                    "goal_alignment": 0.5
                },
                "insights": [f"分析エラー: {str(e)}"]
            }
    
    def _analyze_token_efficiency(self, window: ContextWindow) -> Dict[str, float]:
        """トークン効率性分析"""
        if not window.elements:
            return {}
        
        # 情報密度計算
        total_chars = sum(len(elem.content) for elem in window.elements)
        total_words = sum(len(elem.content.split()) for elem in window.elements)
        
        # 冗長性分析
        redundancy_score = self._calculate_redundancy(window)
        
        return {
            "chars_per_token": total_chars / max(window.current_tokens, 1),
            "words_per_token": total_words / max(window.current_tokens, 1),
            "information_density": total_words / max(total_chars, 1),
            "redundancy_score": redundancy_score,
            "efficiency_score": 1.0 - redundancy_score
        }
    
    def _calculate_redundancy(self, window: ContextWindow) -> float:
        """冗長性計算"""
        if len(window.elements) < 2:
            return 0.0
        
        contents = [elem.content.lower() for elem in window.elements]
        
        # 単語レベルでの重複計算
        all_words = []
        for content in contents:
            words = re.findall(r'\w+', content)
            all_words.extend(words)
        
        if not all_words:
            return 0.0
        
        word_counts = Counter(all_words)
        duplicate_words = sum(count - 1 for count in word_counts.values() if count > 1)
        
        return duplicate_words / len(all_words)
    
    async def _assess_quality(self, window: ContextWindow, metrics: Dict[str, float]) -> Dict[str, Any]:
        """品質評価"""
        
        # 重み付きスコア計算
        weights = {
            "token_utilization": 0.2,
            "topic_consistency": 0.25,
            "logical_flow": 0.2,
            "context_clarity": 0.2,
            "efficiency_score": 0.15
        }
        
        weighted_score = 0.0
        total_weight = 0.0
        
        for metric, weight in weights.items():
            if metric in metrics:
                weighted_score += metrics[metric] * weight
                total_weight += weight
        
        if total_weight > 0:
            quality_score = weighted_score / total_weight
        else:
            quality_score = 0.5
        
        # 問題点と強み、推奨事項の特定
        issues = []
        strengths = []
        recommendations = []
        
        # トークン使用率チェック
        if metrics.get("token_utilization", 0) > 0.9:
            issues.append("トークン使用率が高すぎます（90%超）")
            recommendations.append("低優先度の要素を削除してください")
        elif metrics.get("token_utilization", 0) < 0.3:
            issues.append("トークン使用率が低すぎます（30%未満）")
            recommendations.append("より多くの関連情報を追加できます")
        else:
            strengths.append("適切なトークン使用率です")
        
        # 一貫性チェック
        if metrics.get("topic_consistency", 0) < 0.6:
            issues.append("話題の一貫性が低いです")
            recommendations.append("関連性の低い要素を整理してください")
        else:
            strengths.append("話題の一貫性が良好です")
        
        # 冗長性チェック
        if metrics.get("redundancy_score", 0) > 0.4:
            issues.append("情報の重複が多いです")
            recommendations.append("重複する内容を統合してください")
        else:
            strengths.append("情報の重複が適切に管理されています")
        
        return {
            "score": quality_score,
            "issues": issues,
            "strengths": strengths,
            "recommendations": recommendations
        }
