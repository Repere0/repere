import unittest

from plan_task import requires_human_review


class HumanReviewGateTests(unittest.TestCase):
    def test_sensitive_task_is_always_sent_to_human_review(self):
        task = "Modifier le vote du député et la neutralité de la présentation"
        plan = {
            "title": "Amélioration mobile",
            "objective": "Modifier le rendu d'un écran",
            "rationale": "Changement local",
            "allowed_paths": ["mono/apps/mobile/src/app/"],
            "acceptance_criteria": ["Le rendu est corrigé"],
        }
        self.assertTrue(requires_human_review(task, plan))

    def test_sensitive_plan_text_cannot_be_hidden_by_a_benign_task(self):
        task = "Améliorer la présentation d'un écran"
        plan = {
            "title": "Amélioration",
            "objective": "Vérifier le calcul des données affichées",
            "rationale": "Changement local",
            "allowed_paths": ["mono/apps/mobile/src/app/"],
            "acceptance_criteria": ["Le rendu est corrigé"],
        }
        self.assertTrue(requires_human_review(task, plan))

    def test_small_generic_visual_task_can_remain_green(self):
        task = "Améliorer l'espacement du bouton de partage sans changer son comportement"
        plan = {
            "title": "Ajuster l'espacement",
            "objective": "Améliorer la lisibilité du bouton",
            "rationale": "Modification visuelle locale et réversible",
            "allowed_paths": ["mono/apps/mobile/src/ui/"],
            "acceptance_criteria": ["Le bouton reste accessible"],
        }
        self.assertFalse(requires_human_review(task, plan))


if __name__ == "__main__":
    unittest.main()
