import unittest

from policy_check import validate_paths, validate_plan


def plan(**overrides):
    value = {
        "title": "Corriger un défaut mobile limité",
        "objective": "Corriger un défaut de rendu dans un écran de l'application mobile.",
        "risk": "green",
        "allowed_paths": ["mono/apps/mobile/src/app/"],
        "acceptance_criteria": ["Le défaut est couvert par un test."],
        "estimated_cost_usd": 0.25,
        "max_turns": 3,
        "rationale": "Changement local, réversible et sans impact sur les données.",
    }
    value.update(overrides)
    return value


class PolicyCheckTests(unittest.TestCase):
    def test_accepts_small_green_mobile_task(self):
        self.assertEqual(validate_plan(plan()), [])

    def test_blocks_orange_and_red(self):
        self.assertTrue(validate_plan(plan(risk="orange")))
        self.assertTrue(validate_plan(plan(risk="red")))

    def test_blocks_paths_outside_mobile(self):
        self.assertTrue(validate_plan(plan(allowed_paths=["outils/pipeline.sh"])))
        self.assertTrue(validate_paths(["outils/pipeline.sh"]))
        self.assertTrue(validate_paths([".github/workflows/agent.yml"]))

    def test_blocks_cost_over_limit_and_excess_turns(self):
        self.assertTrue(validate_plan(plan(estimated_cost_usd=0.76)))
        self.assertTrue(validate_plan(plan(max_turns=4)))

    def test_blocks_deletions_and_protected_config(self):
        self.assertTrue(validate_paths(["mono/apps/mobile/src/app/index.tsx"], ["mono/apps/mobile/src/app/old.tsx"]))
        self.assertTrue(validate_paths(["CLAUDE.md"]))
        self.assertTrue(validate_paths(["mono/apps/mobile/package.json"]))

    def test_rejects_extra_fields(self):
        self.assertTrue(validate_plan(plan(unreviewed_action=True)))


if __name__ == "__main__":
    unittest.main()
