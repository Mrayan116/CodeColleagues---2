from enum import Enum


class SkillLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class Language(str, Enum):
    python = "python"
    java = "java"
    cpp = "cpp"
    c = "c"
    javascript = "javascript"
    typescript = "typescript"


class Severity(str, Enum):
    critical = "critical"   # 🔴
    warning = "warning"     # 🟠
    improvement = "improvement"  # 🟡
    suggestion = "suggestion"    # 🔵


class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
