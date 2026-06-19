describe('Gestión de Mesas', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/');

    cy.get('input').first().type('admin@polleria.com');
    cy.get('input').eq(1).type('Admin123!');
    cy.contains('Entrar').click();
    cy.location('pathname').should('eq', '/dashboard');
    cy.visit('http://localhost:5173/mesas');
  });
  
  it('crear, editar y eliminar una mesa', () => {

    // Crear mesa
    cy.contains('Nueva mesa').click();
    cy.get('input[placeholder="Número"]')
      .type('98');
    cy.get('input[placeholder="Capacidad"]')
      .type('4');
    cy.contains('Crear mesa').click();
    cy.contains('Mesa 98')
      .should('exist');
    cy.contains('4 personas')
      .should('exist');

    // Editar mesa
    cy.contains('Mesa 98')
      .parents('div.bg-white')
      .first()
      .find('button')
      .click();
    cy.get('input')
      .first()
      .clear()
      .type('99');
    cy.get('input')
      .eq(1)
      .clear()
      .type('6');
    cy.contains('Guardar cambios')
      .click();
    cy.contains('Mesa 99')
      .should('exist');
    cy.contains('6 personas')
      .should('exist');

    // Eliminar mesa
    cy.contains('Mesa 99')
      .parents('div.bg-white')
      .first()
      .find('button')
      .click();
    cy.contains('Eliminar mesa')
      .click();
    cy.contains('Mesa 99')
      .should('not.exist');
  });
});