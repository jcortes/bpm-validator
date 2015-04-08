describe('ccLibrary module', function(){
    beforeEach(module('ccLibrary'));
    
    describe('ccCountries factory', function(){
        
        var dataJSON, ccCountries, $httpBackend, reqHandler;
        
        beforeEach(inject(function($injector) {
            $http = $injector.get('$http');
            // Set up the mock http service responses
            $httpBackend = $injector.get('$httpBackend');
            
            // Very Useful !
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/test/mock';
            dataJSON = getJSONFixture('countryInfoJSON.json');
            // backend definition common for list of countries
            reqHandler = $httpBackend.whenGET('http://api.geonames.org/countryInfoJSON?username=jcortes').respond(dataJSON);
            
            ccCountries = $injector.get('ccCountries');
        }));
        
        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('Should return a country list when query the countryInfoJSON web service endpoint', function(){
            ccCountries.getCountries().then(function(data){
                //dump(data);
                //console.log(data.data.geonames.length);
                //dump(dataJSON);
                //console.log(dataJSON.geonames.length);
                expect(data.data).toEqual(dataJSON);
            });
            $httpBackend.flush();
        });
        
        it('The country list should have 250 countries', function(){
            ccCountries.getCountries().then(function(data){
                expect(data.data.geonames.length).toEqual(250);
            });
            $httpBackend.flush();
        });
    });
});