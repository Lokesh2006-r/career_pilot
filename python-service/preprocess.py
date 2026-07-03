"""
Resume Dataset Preprocessor
============================
Downloads the Kaggle resume dataset and generates resume_dataset.json
for use by the Node.js resume analyzer backend.

Usage:
  pip install -r requirements.txt
  python preprocess.py

Kaggle credentials must be set up:
  https://github.com/Kaggle/kagglehub#authentication

Output:
  ../server/src/data/resume_dataset.json
"""

import json
import os
import re
import sys
from collections import Counter

# ---------------------------------------------------------------------------
# 1. Load dataset via kagglehub
# ---------------------------------------------------------------------------
try:
    import kagglehub
    from kagglehub import KaggleDatasetAdapter

    print("Downloading Kaggle dataset (snehaanbhawal/resume-dataset)...")
    df = kagglehub.load_dataset(
        KaggleDatasetAdapter.PANDAS,
        "snehaanbhawal/resume-dataset",
        "",
    )
    print(f"Loaded {len(df)} resumes across {df['Category'].nunique()} categories.\n")
except Exception as e:
    print(f"[ERROR] Could not load Kaggle dataset: {e}")
    print("Make sure you have kagglehub configured with valid Kaggle credentials.")
    sys.exit(1)

# ---------------------------------------------------------------------------
# 2. Extract skills/keywords per category
# ---------------------------------------------------------------------------

# Common tech skill tokens to look for (case-insensitive)
SKILL_PATTERNS = [
    r'\bpython\b', r'\bjava\b', r'\bc\+\+\b', r'\bc#\b', r'\bruby\b',
    r'\bjavascript\b', r'\btypescript\b', r'\bsql\b', r'\bnosql\b',
    r'\breact\b', r'\bangular\b', r'\bvue\b', r'\bnode\.?js\b',
    r'\bdjango\b', r'\bflask\b', r'\bspring\b', r'\blaravel\b',
    r'\bmachine learning\b', r'\bdeep learning\b', r'\bai\b',
    r'\bdata science\b', r'\bdata analysis\b', r'\bstatistics\b',
    r'\btensorflow\b', r'\bpytorch\b', r'\bkeras\b', r'\bscikit[- ]?learn\b',
    r'\bpandas\b', r'\bnumpy\b', r'\bmatplotlib\b', r'\bseaborn\b',
    r'\baws\b', r'\bazure\b', r'\bgcp\b', r'\bcloud\b',
    r'\bdocker\b', r'\bkubernetes\b', r'\bci[/ ]?cd\b', r'\bjenkins\b',
    r'\bgit\b', r'\bgithub\b', r'\blinux\b', r'\brest api\b',
    r'\bgraphql\b', r'\bmongodb\b', r'\bpostgresql\b', r'\bmysql\b',
    r'\bredis\b', r'\belasticsearch\b', r'\bkafka\b',
    r'\bexcel\b', r'\bpowerpoint\b', r'\btableau\b', r'\bpower bi\b',
    r'\bfigma\b', r'\bphotoshop\b', r'\billustrator\b',
    r'\bhtml\b', r'\bcss\b', r'\bbootstrap\b', r'\btailwind\b',
    r'\bunit testing\b', r'\bjunit\b', r'\bpytest\b', r'\bmocha\b',
    r'\bscrum\b', r'\bagile\b', r'\bjira\b', r'\bconfluence\b',
    r'\bcommunication\b', r'\bteamwork\b', r'\bproblem solving\b',
    r'\bproject management\b', r'\bleadership\b',
    r'\baccounting\b', r'\bfinance\b', r'\baudit\b', r'\btax\b',
    r'\bnursing\b', r'\bhealthcare\b', r'\bpatient care\b',
    r'\bteaching\b', r'\beducation\b', r'\bcurriculum\b',
    r'\bsales\b', r'\bmarketing\b', r'\bseo\b', r'\bcrm\b',
    r'\brecruiting\b', r'\bhr\b', r'\bpayroll\b', r'\bonboarding\b',
]

def extract_skills_from_text(text: str) -> list[str]:
    """Return list of matched skill tokens from resume text."""
    text_lower = text.lower()
    found = set()
    for pattern in SKILL_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            # Normalise to a clean title
            raw = match.group(0).strip()
            found.add(raw.title().replace('.Js', '.js').replace('Ci/Cd', 'CI/CD').replace('Rest Api', 'REST API'))
    return list(found)


def compute_ats_proxy(text: str) -> int:
    """
    Rough heuristic ATS score proxy:
    - Penalise short resumes
    - Reward quantified metrics (numbers)
    - Reward standard sections
    """
    score = 50
    word_count = len(text.split())
    if word_count > 400:
        score += 10
    if word_count > 700:
        score += 10
    # quantified metrics
    metric_matches = len(re.findall(r'\d+[\%x]|\$[\d,]+|\d+\s*(years?|months?|users?|people|team)', text, re.I))
    score += min(metric_matches * 3, 20)
    # standard sections
    for section in ['experience', 'education', 'skills', 'projects', 'summary']:
        if section in text.lower():
            score += 2
    return min(score, 100)


categories_data: dict = {}

for category, group in df.groupby('Category'):
    all_skills: list[str] = []
    ats_scores: list[int] = []

    for _, row in group.iterrows():
        resume_text = str(row.get('Resume', row.get('resume_str', '')))
        skills = extract_skills_from_text(resume_text)
        all_skills.extend(skills)
        ats_scores.append(compute_ats_proxy(resume_text))

    skill_freq = Counter(all_skills)
    top_skills = [skill for skill, _ in skill_freq.most_common(20)]
    avg_ats = round(sum(ats_scores) / len(ats_scores)) if ats_scores else 65

    categories_data[category] = {
        "count": len(group),
        "topSkills": top_skills,
        "avgAtsScore": avg_ats,
    }

# ---------------------------------------------------------------------------
# 3. Write output JSON
# ---------------------------------------------------------------------------
output = {
    "generatedAt": __import__('datetime').datetime.utcnow().isoformat() + "Z",
    "totalResumes": len(df),
    "categories": sorted(categories_data.keys()),
    "byCategory": categories_data,
}

out_path = os.path.join(os.path.dirname(__file__), '..', 'server', 'src', 'data', 'resume_dataset.json')
os.makedirs(os.path.dirname(out_path), exist_ok=True)

with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"Done! Wrote {len(categories_data)} categories to:\n  {os.path.abspath(out_path)}")
